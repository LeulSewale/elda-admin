"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload, X, FileText, Image, FileArchive } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'

type CreateRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

export function CreateRequestModal({ open, onOpenChange, onSubmit }: CreateRequestModalProps) {
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');
  
  const steps = [
    { id: 1, name: t('personalInformation') },
    { id: 2, name: t('serviceDetail') },
    { id: 3, name: t('additionalInformation') },
  ]
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    disability: "",
    serviceType: "",
    issueDescription: "",
    urgency: "medium",
    preferredContact: "email",
    additionalNotes: ""
  })
  
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNext = () => {
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      // Check if adding these files would exceed the 5 file limit
      if (files.length + newFiles.length > 5) {
        alert(`${t('tooManyFiles')} ${files.length} ${t('filesSelectedCount')}`);
        return;
      }
      
      // Validate file sizes (max 10MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        alert(t('filesTooLarge'));
        return;
      }
      
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0]
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4 mr-2" />
      case 'application':
        if (file.type.includes('pdf')) {
          return <FileText className="w-4 h-4 mr-2" />
        } else if (file.type.includes('zip') || file.type.includes('compressed')) {
          return <FileArchive className="w-4 h-4 mr-2" />
        }
        return <FileText className="w-4 h-4 mr-2" />
      default:
        return <FileText className="w-4 h-4 mr-2" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = () => {
    if (isStepValid(currentStep)) {
      // Transform form data to match API structure
      const apiData = {
        priority: formData.urgency,
        disability_type: formData.disability,
        service_type: formData.serviceType,
        description: formData.issueDescription,
        contact_method: formData.preferredContact,
        remarks: formData.additionalNotes,
        is_confidential: false,
        document: "" // Empty string as per API spec
      }
      
      console.debug("[Create Request] Submitting data:", apiData)
      console.debug("[Create Request] Files:", files)
      console.debug("[Create Request] Form data state:", formData)
      
      // Validate that required fields are not empty
      if (!formData.disability || !formData.serviceType || !formData.issueDescription) {
        console.error("[Create Request] Missing required fields:", {
          disability: formData.disability,
          serviceType: formData.serviceType,
          issueDescription: formData.issueDescription
        });
        alert(t('fillRequiredFields'));
        return;
      }
      
      // Pass both data and files to the parent component
      onSubmit?.({ data: apiData, files: files })
      onOpenChange(false)
      setCurrentStep(1)
      setFiles([])
      setFormData({
        disability: "",
        serviceType: "",
        issueDescription: "",
        urgency: "medium",
        preferredContact: "email",
        additionalNotes: ""
      })
    }
  }

  // ✅ Step Validation Logic
  const isStepValid = (step: number) => {
    if (step === 1) {
      return formData.disability.trim() !== ""
    }
    if (step === 2) {
      return (
        formData.serviceType.trim() !== "" &&
        formData.issueDescription.trim() !== ""
      )
    }
    return true // Step 3 has no required fields for now
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[#4082ea] font-semibold">{t('requestProcess')}</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#e7eeff] rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border font-medium",
                  currentStep === step.id && "bg-[#4082ea] text-white border-[#4082ea]",
                  currentStep > step.id && "bg-[#4082ea] text-white border-[#4082ea]",
                  currentStep < step.id && "bg-white text-gray-500 border-gray-300"
                )}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm",
                  currentStep >= step.id ? "text-[#4082ea]" : "text-gray-500"
                )}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-6">
          {/* Step 1 */}
          {currentStep === 1 && (
            <Card className="shadow-md">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-[#4082ea]">{t('personalInformation')}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>{t('typeOfDisability')} *</Label>
                    <Select
                      value={formData.disability}
                      onValueChange={(value) => setFormData({ ...formData, disability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectDisability')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visually_impaired">{t('visuallyImpaired')}</SelectItem>
                        <SelectItem value="hearing_impaired">{t('hearingImpaired')}</SelectItem>
                        <SelectItem value="mobility_impaired">{t('mobilityImpaired')}</SelectItem>
                        <SelectItem value="cognitive_impaired">{t('cognitiveImpaired')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <Card className="shadow-md">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-[#4082ea]">{t('serviceDetails')}</h3>
                <div>
                  <Label>{t('serviceType')} *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectServiceType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internet">{t('internetService')}</SelectItem>
                      <SelectItem value="phone">{t('phoneService')}</SelectItem>
                      <SelectItem value="tv">{t('tvService')}</SelectItem>
                      <SelectItem value="mobile">{t('mobileService')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('issueDescription')} *</Label>
                  <Textarea
                    placeholder={t('describeIssueDetail')}
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  />
                </div>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-[#e7eeff] border-[#4082ea]/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept="*/*"
                  />
                  <Upload className="mx-auto mb-2 text-[#4082ea]" size={32} />
                  <p className="text-sm text-gray-600">{t('clickToUpload')}</p>
                  <p className="text-xs text-gray-400">{t('anyFileType')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('filesSelected')}: {files.length}/5
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <Card className="shadow-md">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-[#4082ea] mb-4">{t('additionalInformation')}</h3>
                
                <div>
                  <Label>{t('urgencyLevel')}</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectUrgencyLevel')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('notUrgent')}</SelectItem>
                      <SelectItem value="medium">{t('standardPriority')}</SelectItem>
                      <SelectItem value="high">{t('urgentAttentionNeeded')}</SelectItem>
                      <SelectItem value="urgent">{t('immediateAttention')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('preferredContactMethod')}</Label>
                  <Select
                    value={formData.preferredContact}
                    onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPreferredContactMethod')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">{t('email')}</SelectItem>
                      <SelectItem value="phone">{t('phoneCall')}</SelectItem>
                      <SelectItem value="sms">{t('sms')}</SelectItem>
                      <SelectItem value="whatsapp">{t('whatsapp')}</SelectItem>
                      <SelectItem value="telegram">{t('telegram')}</SelectItem>
                      <SelectItem value="messenger">{t('messenger')}</SelectItem>
                      <SelectItem value="instagram">{t('instagram')}</SelectItem>
                      <SelectItem value="twitter">{t('twitter')}</SelectItem>
                      <SelectItem value="linkedin">{t('linkedin')}</SelectItem>
                      <SelectItem value="facebook">{t('facebook')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('additionalNotes')}</Label>
                  <Textarea
                    placeholder={t('otherInformationHelpful')}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#4082ea] focus:ring-[#4082ea]"
                        required

                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700">
                        {t('confirmInformationAccurate')}
                      </label>
                      <p className="text-gray-500">
                        {t('informationConfidential')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end gap-2 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-[#4082ea] text-[#4082ea]"
            >
              {tCommon('previous')}
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1]"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              {tCommon('next')}
            </Button>
          ) : (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1]"
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep)}
            >
              {tCommon('submit')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
