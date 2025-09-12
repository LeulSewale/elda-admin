"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronLeft, ChevronRight, Upload, X, FileText, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type CreateRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

type RequestFormData = {
  serviceType: string
  requestType: string
  priority: string
  title: string
  description: string
  attachments: File[]
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address: string
  }
}

const steps = [
  { id: 1, name: "Request Details", icon: FileText },
  { id: 2, name: "Service Details", icon: Settings },
  { id: 3, name: "Additional Information", icon: User },
]

const serviceTypes = [
  "Disability Rights Advocacy",
  "Employment Law Assistance", 
  "Social Security Claims",
  "Accessibility Rights",
  "Legal Document Preparation",
  "Court Representation",
  "Legal Consultation"
]

const requestTypes = {
  "Disability Rights Advocacy": ["Discrimination Case", "Rights Violation", "Accessibility Complaint", "Disability Benefits Appeal"],
  "Employment Law Assistance": ["Workplace Discrimination", "Reasonable Accommodation", "Wrongful Termination", "Employment Contract Review"],
  "Social Security Claims": ["Disability Pension Application", "Benefits Appeal", "Medical Assessment Support", "Documentation Assistance"],
  "Accessibility Rights": ["Public Access Violation", "Transportation Rights", "Education Access", "Healthcare Access"],
  "Legal Document Preparation": ["Power of Attorney", "Will and Testament", "Guardianship Documents", "Legal Affidavits"],
  "Court Representation": ["Civil Rights Case", "Employment Tribunal", "Disability Appeals Court", "Family Court Matters"],
  "Legal Consultation": ["Rights Assessment", "Legal Options Review", "Case Evaluation", "Legal Guidance"]
}

const priorities = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" }
]

export function CreateRequestModal({ open, onOpenChange, onSubmit }: CreateRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RequestFormData>({
    serviceType: "",
    requestType: "",
    priority: "",
    title: "",
    description: "",
    attachments: [],
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: ""
    }
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Generate request number
    const requestNumber = `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    
    const requestData = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      requestNumber,
      requestedDate: new Date(),
      updatedAt: new Date(),
      status: "pending",
      requestedBy: formData.personalInfo.fullName,
      user: {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.personalInfo.fullName,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        address: formData.personalInfo.address
      }
    }

    onSubmit?.(requestData)
    onOpenChange(false)
    
    // Reset form
    setCurrentStep(1)
    setFormData({
      serviceType: "",
      requestType: "",
      priority: "",
      title: "",
      description: "",
      attachments: [],
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: ""
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.personalInfo.fullName && formData.personalInfo.email && formData.personalInfo.phone && formData.serviceType
      case 2:
        return formData.requestType && formData.priority && formData.title && formData.description
      case 3:
        return formData.personalInfo.fullName && formData.personalInfo.email && formData.personalInfo.phone
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Create New Request</DialogTitle>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Left Sidebar - Steps */}
          <div className="w-64 bg-gray-50 p-4 border-r">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">User Panel</h3>
                <div className="space-y-2">
                  {steps.map((step) => {
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id
                    const isValid = isStepValid(step.id)
                    
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center p-2 rounded-lg cursor-pointer transition-colors",
                          isActive && "bg-[#A4D65E] text-white",
                          !isActive && isCompleted && "bg-green-100 text-green-800",
                          !isActive && !isCompleted && "hover:bg-gray-100"
                        )}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs",
                          isActive && "bg-white text-[#A4D65E]",
                          !isActive && isCompleted && "bg-green-600 text-white",
                          !isActive && !isCompleted && "bg-gray-300 text-gray-600"
                        )}>
                          {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                        </div>
                        <step.icon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{step.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Progress Tracking</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                      currentStep >= 1 ? "bg-[#A4D65E] text-white" : "bg-gray-300 text-gray-600"
                    )}>
                      {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
                    </div>
                    <span className="text-sm">Service Type Selection</span>
                  </div>
                  <div className="flex items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                      currentStep >= 2 ? "bg-[#A4D65E] text-white" : "bg-gray-300 text-gray-600"
                    )}>
                      {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
                    </div>
                    <span className="text-sm">Service Details</span>
                  </div>
                  <div className="flex items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                      currentStep >= 3 ? "bg-[#A4D65E] text-white" : "bg-gray-300 text-gray-600"
                    )}>
                      {currentStep > 3 ? <Check className="w-3 h-3" /> : "3"}
                    </div>
                    <span className="text-sm">Additional Information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Step 1: Request Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Request Process</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-[#A4D65E] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Service Type Selection</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                      <p className="text-xs text-gray-600">Service Details</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                      <p className="text-xs text-gray-600">Additional Information</p>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.personalInfo.fullName}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.personalInfo.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.personalInfo.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceType">Type of Service</Label>
                        <Select 
                          value={formData.serviceType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value, requestType: "" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Request Process</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Service Type Selection</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-[#A4D65E] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Service Details</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                      <p className="text-xs text-gray-600">Additional Information</p>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Service Details</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="requestType">Request Type</Label>
                        <Select 
                          value={formData.requestType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Request Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.serviceType && requestTypes[formData.serviceType as keyof typeof requestTypes]?.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          value={formData.priority} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center">
                                  <Badge className={`${priority.color} mr-2`}>
                                    {priority.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="title">Request Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter a brief title for your request"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Provide detailed information about your request..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Request Process</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Service Type Selection</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Service Details</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-[#A4D65E] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-600">Additional Information</p>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Additional Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.personalInfo.address}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, address: e.target.value }
                          }))}
                          placeholder="Enter your full address..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Attachments</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and drop files here, or click to browse
                          </p>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>

                        {formData.attachments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {formData.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Please review all information before submitting. 
                          Once submitted, you will receive a confirmation email with your request number.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep)}
                    className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white"
                  >
                    Create New Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep >= step.id ? "bg-[#A4D65E]" : "bg-gray-300"
                )}
              />
            ))}
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep)}
              className="bg-[#A4D65E] hover:bg-[#A4D65E]/90 text-white"
            >
              Submit Request
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
