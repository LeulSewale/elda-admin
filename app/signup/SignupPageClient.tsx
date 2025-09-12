'use client'
  
  import { useForm as useReactHookForm } from "react-hook-form"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { FileText, Pencil, Upload, X, File } from "lucide-react"
  import Link from "next/link"
  import { useRouter } from "next/navigation"
  import { useMutation } from "@tanstack/react-query"
  import { authApi } from "@/lib/api/auth"
  import { toast } from "@/hooks/use-toast"
  import logo from "../../public/tele_tender.png"
  import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
  import { useState } from "react"
  import Image from "next/image"
  
  export default function SignupPageClient() {
  const router = useRouter()
  const [documents, setDocuments] = useState<File[]>([])
    const registerMutation = useMutation({
      mutationFn: async (formData: FormData) => authApi.register(formData),
      onSuccess: (response) => {
        toast({
          title: "Success",
          description: "Account created successfully. Please verify your phone number.",
          duration: 3000,
        })
        // Get user ID from response and phone number from form data
        const userId = response?.data?.data?._id
        const phoneNumber = form.getValues("phoneNumber")
        setTimeout(() => {
          router.push(`/verify-otp?userId=${encodeURIComponent(userId)}&phone=${encodeURIComponent(phoneNumber)}`)
        }, 1000)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || error?.message || "Registration failed",
          variant: "destructive",
          duration: 3000,
        })
      },
    })
  
      const form = useReactHookForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  })

  const handleDocumentUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => {
      // Allow common document types
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, Word, Excel, or image files.`,
          variant: "destructive",
        })
        return false
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        })
        return false
      }
      
      return true
    })
    
    setDocuments(prev => [...prev, ...validFiles])
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }
  
      const onSubmit = (values: any) => {
    // Validate that documents are uploaded
    if (documents.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one company document.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("fullName", values.fullName)
    formData.append("phoneNumber", values.phoneNumber)
    formData.append("email", values.email)
    formData.append("password", values.password)
    formData.append("role", "company")
    formData.append("status", "pending")
    
    // Append all documents as an array
    documents.forEach((doc) => {
      console.log(doc)
      formData.append(`files`, doc)
    })
    
    registerMutation.mutate(formData)
  }
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
  
          <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <Image
                  src={logo}
                  alt="Tele Tender Logo"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-lg"
                  style={{ background: 'white', borderRadius: '1.5rem', border: '2px solid #A4D65E', padding: '0.5rem' }}
                />
              </div>
              <h1 className="text-6xl font-bold text-[#A4D65E]">TELE TENDER</h1>
            </div>
          </div>
                     {/* Right side - Register Form */}
           <div className="w-full max-w-lg lg:max-w-2xl mx-auto">
             <Card className="bg-gradient-to-br from-white via-[#f6ffe8] to-[#e8f7d4] shadow-md rounded-xl lg:rounded-2xl border-0 transition-transform duration-300 hover:scale-[1.02] animate-fade-in">
                               <CardHeader className="text-center px-4 lg:px-6">
                  <CardTitle className="text-2xl lg:text-3xl text-[#A4D65E] font-extrabold tracking-tight">TELE TENDER</CardTitle>
                  <div className="mt-2 text-gray-500 text-base lg:text-lg font-medium">Create your company account</div>
                  <div className="mt-1 text-gray-400 text-xs lg:text-sm">Join thousands of companies in the tender marketplace</div>
                </CardHeader>
               <div className="border-b border-gray-200 mx-4 lg:mx-6 mb-4 lg:mb-6" />
               <CardContent className="space-y-4 lg:space-y-6 px-4 lg:px-6">
                                 <Form {...form}>
                   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     {/* First four fields in two columns */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                       <FormField
                         control={form.control}
                         name="fullName"
                         rules={{ required: "Full name is required" }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Company Name</FormLabel>
                             <FormControl>
                               <Input
                                 type="text"
                                 placeholder="Enter your company name"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="phoneNumber"
                         rules={{ 
                           required: "Phone number is required",
                           pattern: {
                             value: /^(\+251|251|0)(9\d{8}|7\d{8})$/,
                             message: "Please enter a valid Ethiopian phone number (e.g., +251912345678, 251912345678, 0912345678, 0712345678)"
                           }
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Phone Number</FormLabel>
                             <FormControl>
                               <Input
                                 type="tel"
                                 placeholder="Enter Ethiopian phone number"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="email"
                         rules={{
                           required: "Email is required",
                           pattern: {
                             value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                             message: "Please enter a valid email address",
                           },
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Email Address</FormLabel>
                             <FormControl>
                               <Input
                                 type="email"
                                 placeholder="Enter your email address"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="password"
                         rules={{ required: "Password is required" }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Password</FormLabel>
                             <FormControl>
                               <Input
                                 type="password"
                                 placeholder="Enter password"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>
                    
                                         {/* Company Documents Upload */}
                     <div className="space-y-3">
                       <FormLabel className="flex items-center gap-1">
                         Company Documents
                         <span className="text-red-500">*</span>
                       </FormLabel>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 lg:p-4 hover:border-[#A4D65E] transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-6 w-6 lg:h-8 lg:w-8 text-gray-400 mb-2" />
                          <p className="text-xs lg:text-sm text-gray-600 mb-2">
                            Upload company documents (PDF, Word, Excel, Images)
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Maximum 10MB per file. Multiple files allowed.
                          </p>
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                            onChange={(e) => handleDocumentUpload(e.target.files)}
                            disabled={registerMutation.isPending}
                            className="hidden"
                            id="document-upload"
                          />
                          <Label
                            htmlFor="document-upload"
                            className="cursor-pointer bg-[#A4D65E] hover:bg-[#8FCB4A] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Choose Files
                          </Label>
                        </div>
                      </div>
                      
                                             {/* Display uploaded documents */}
                       {documents.length > 0 ? (
                         <div className="space-y-2">
                           <p className="text-xs lg:text-sm font-medium text-gray-700">Uploaded Documents:</p>
                           <div className="space-y-2">
                             {documents.map((doc, index) => (
                               <div
                                 key={index}
                                 className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg border"
                               >
                                 <div className="flex items-center space-x-2 min-w-0 flex-1">
                                   <File className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 flex-shrink-0" />
                                   <span className="text-xs lg:text-sm text-gray-700 truncate">{doc.name}</span>
                                   <span className="text-xs text-gray-500 flex-shrink-0">
                                     ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                                   </span>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={() => removeDocument(index)}
                                   disabled={registerMutation.isPending}
                                   className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                 >
                                   <X className="w-3 h-3 lg:w-4 lg:h-4" />
                                 </button>
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className="text-xs lg:text-sm text-red-500">
                           * At least one company document is required
                         </div>
                       )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-10 lg:h-12 bg-[#A4D65E] hover:bg-[#8FCB4A] text-white text-sm lg:text-base"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registering..." : "Register"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-xs lg:text-sm text-gray-600">
                  {"Already have an account? "}
                  <Link href="/login" className="text-[#A4D65E] hover:underline font-semibold">
                    Login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } 