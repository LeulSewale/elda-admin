"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateUser: (userData: { name: string; email: string; phone: string; password: string; role: string }) => void
  isLoading?: boolean
}

export function CreateUserModal({ open, onOpenChange, onCreateUser, isLoading }: CreateUserModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.password) {
      onCreateUser(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createNewUser')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tCommon('name')}</Label>
            <Input
              id="name"
              placeholder={t('enterFullName')}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{tCommon('email')} <span className="text-gray-400 text-xs">({tCommon('optional')})</span></Label>
            <Input
              id="email"
              type="email"
              placeholder={t('enterEmail')}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{tCommon('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('enterPhone')}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{tCommon('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('enterPassword')}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">{t('role')}</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('user')}</SelectItem>
                <SelectItem value="admin">{t('admin')}</SelectItem>
                <SelectItem value="lawyer">{t('lawyer')}</SelectItem>
                <SelectItem value="HR-manager">{t('HR-manager') || 'HR Manager'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('loading')}
                </>
              ) : (
                tCommon('create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
