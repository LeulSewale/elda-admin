"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload, X, FileText, Image, FileArchive } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type CreateRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

const steps = [
  { id: 1, name: "Personal Information" },
  { id: 2, name: "Service Detail" },
  { id: 3, name: "Additional Information" },
]

export function CreateRequestModal({ open, onOpenChange, onSubmit }: CreateRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    disability: "",
    serviceType: "",
    issueDescription: "",
    urgency: "medium",
    preferredContact: "phone",
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
        alert(`You can only upload up to 5 files. Currently you have ${files.length} files selected.`);
        return;
      }
      
      // Validate file sizes (max 10MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        alert(`Some files are too large. Maximum file size is 10MB.`);
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
      }
      
      console.debug("[Create Request] Submitting data:", apiData)
      console.debug("[Create Request] Files:", files)
      
      // Pass both data and files to the parent component
      onSubmit?.({ data: apiData, files: files })
      onOpenChange(false)
      setCurrentStep(1)
      setFiles([])
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        disability: "",
        serviceType: "",
        issueDescription: "",
        urgency: "medium",
        preferredContact: "phone",
        additionalNotes: ""
      })
    }
  }

  // ✅ Step Validation Logic
  const isStepValid = (step: number) => {
    if (step === 1) {
      return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.disability.trim() !== ""
      )
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
          <DialogTitle className="text-[#4082ea] font-semibold">Request Process</DialogTitle>
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
                <h3 className="font-semibold text-[#4082ea]">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      placeholder="Enter text here"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      placeholder="Enter text here"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      placeholder="Enter text here"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      placeholder="Enter text here"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Type of disability *</Label>
                    <Select
                      value={formData.disability}
                      onValueChange={(value) => setFormData({ ...formData, disability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select disability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visually-impaired">Visually Impaired</SelectItem>
                        <SelectItem value="hearing-impaired">Hearing Impaired</SelectItem>
                        <SelectItem value="mobility">Mobility Disability</SelectItem>
                        <SelectItem value="cognitive">Cognitive Disability</SelectItem>
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
                <h3 className="font-semibold text-[#4082ea]">Service Details</h3>
                <div>
                  <Label>Service Type *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internet">Internet Service</SelectItem>
                      <SelectItem value="legal">Legal Assistance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Issue Description *</Label>
                  <Textarea
                    placeholder="Please describe your issue in detail."
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
                  <p className="text-sm text-gray-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400">Any file type (max 5 files, 10MB each)</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Files selected: {files.length}/5
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
                <h3 className="font-semibold text-[#4082ea] mb-4">Additional Information</h3>
                
                <div>
                  <Label>Urgency Level</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Not urgent</SelectItem>
                      <SelectItem value="medium">Medium - Standard priority</SelectItem>
                      <SelectItem value="high">High - Urgent attention needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Preferred Contact Method</Label>
                  <Select
                    value={formData.preferredContact}
                    onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="any">Any Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any other information that might be helpful..."
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
                        I confirm that the information provided is accurate to the best of my knowledge
                      </label>
                      <p className="text-gray-500">
                        Your information will be kept confidential and used only for the purpose of processing your request.
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
              Previous
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1]"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1]"
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep)}
            >
              Submit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
