"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Save, User as UserIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { useState, useRef } from "react"
import { usersApi } from "@/lib/api/users"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user } = useAuth() as { user: User | null }
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData()
      
      // Add form fields
      formData.append('fullName', data.fullName)
      formData.append('email', data.email)
      formData.append('phoneNumber', data.phoneNumber)
      
      // Add profile image if selected (only when saving)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }
      
      return await usersApi.updateProfile(formData)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
      // Clear selected image and preview after successful save
      setSelectedImage(null)
      setPreviewUrl(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      })
    },
  })


  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    },
    onSubmit: async ({ value }) => {
      updateProfileMutation.mutate(value)
    },
  })

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 2MB",
          variant: "destructive",
        })
        return
      }
      
      setSelectedImage(file)
      
      // Create preview URL for display only
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const getProfileImageUrl = () => {
    if (previewUrl) return previewUrl
    if (user?.profileImage?.url) return user.profileImage.url
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile Management
          </DialogTitle>
          <DialogDescription>
            Update your personal information and profile photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    profileForm.handleSubmit()
                  }}
                  className="space-y-6"
                >
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={getProfileImageUrl() || "/placeholder-user.jpg"} 
                        alt="Profile" 
                      />
                      <AvatarFallback className="bg-[#A4D65E] text-white text-xl">
                        {typeof user?.fullName === "string" && user.fullName
                          ? user.fullName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                                             <Button 
                         type="button"
                         variant="outline" 
                         size="sm"
                         onClick={(e) => {
                           e.preventDefault()
                           e.stopPropagation()
                           fileInputRef.current?.click()
                         }}
                         disabled={updateProfileMutation.isPending}
                       >
                        <Camera className="w-4 h-4 mr-2" />
                        {selectedImage ? "Change Photo" : "Upload Photo"}
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
                      {selectedImage && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {selectedImage.name} selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Start of profile fields grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <profileForm.Field name="fullName">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      )}
                    </profileForm.Field>

                    <profileForm.Field name="email">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      )}
                    </profileForm.Field>

                    <profileForm.Field name="phoneNumber">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={updateProfileMutation.isPending}
                          />
                        </div>
                      )}
                    </profileForm.Field>
                  </div>               

                   <div className="flex justify-end gap-2">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => {
                         setSelectedImage(null)
                         setPreviewUrl(null)
                         profileForm.reset()
                       }}
                       disabled={updateProfileMutation.isPending}
                     >
                       Cancel
                     </Button>
                     <Button
                       type="submit"
                       disabled={updateProfileMutation.isPending}
                       className="bg-[#A4D65E] hover:bg-[#95C653]"
                     >
                       <Save className="w-4 h-4 mr-2" />
                       {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                     </Button>
                   </div>
                </form>
              </CardContent>
            </Card>
          </div>
      </DialogContent>
    </Dialog>
  )
}
