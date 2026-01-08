"use client"

import { useState, useRef, ChangeEvent, useCallback, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Upload, X, FileText, Image, FileArchive } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'
import { toast } from "@/hooks/use-toast"

type CreateRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

export function CreateRequestModal({ open, onOpenChange, onSubmit }: CreateRequestModalProps) {
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');

  // Memoize steps to avoid recreation on every render
  const steps = useMemo(() => [
    { id: 1, name: t('personalInformation') },
    { id: 2, name: t('serviceDetail') },
    { id: 3, name: t('additionalInformation') },
  ], [t])

  // Initial form state - memoized to prevent infinite loops
  const initialFormData = useMemo(() => ({
    disability: "",
    serviceType: "",
    issueDescription: "",
    urgency: "medium",
    preferredContact: "email",
    additionalNotes: "",
    // Fields for "self"
    selfSex: "",
    selfRegion: "",
    selfCity: "",
    selfSubCity: "",
    selfKebele: "",
    selfAge: "",
    // Fields for "other person"
    firstName: "",
    lastName: "",
    sex: "",
    region: "",
    city: "",
    subCity: "",
    kebele: "",
    age: "",
    phoneNumber1: "",
    phoneNumber2: ""
  }), [])

  const [currentStep, setCurrentStep] = useState(1)
  const [requestFor, setRequestFor] = useState<"self" | "other">("self")
  const [formData, setFormData] = useState(initialFormData)
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null)
  const [disabilityCardFile, setDisabilityCardFile] = useState<File | null>(null)
  const [disabilityAuthFile, setDisabilityAuthFile] = useState<File | null>(null)
  const [otherFile, setOtherFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false) // Ref to prevent double submission
  const nationalIdInputRef = useRef<HTMLInputElement>(null)
  const disabilityCardInputRef = useRef<HTMLInputElement>(null)
  const disabilityAuthInputRef = useRef<HTMLInputElement>(null)
  const otherFileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Step Validation Logic - Memoized for performance
  const isStepValid = useCallback((step: number) => {
    if (step === 1) {
      const disabilityValid = formData.disability.trim() !== ""
      if (requestFor === "self") {
        // If for self, validate required fields
        return disabilityValid &&
          formData.selfSex.trim() !== "" &&
          formData.selfRegion.trim() !== "" &&
          formData.selfCity.trim() !== "" &&
          formData.selfSubCity.trim() !== "" &&
          formData.selfKebele.trim() !== "" &&
          formData.selfAge.trim() !== ""
      } else {
        // If for other person, validate required fields
        return disabilityValid &&
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          formData.sex.trim() !== "" &&
          formData.region.trim() !== "" &&
          formData.city.trim() !== "" &&
          formData.subCity.trim() !== "" &&
          formData.kebele.trim() !== "" &&
          formData.age.trim() !== "" &&
          formData.phoneNumber1.trim() !== ""
      }
    }
    if (step === 2) {
      return (
        formData.serviceType.trim() !== "" &&
        formData.issueDescription.trim() !== "" &&
        nationalIdFile !== null
      )
    }
    return true // Step 3 has no required fields for now
  }, [formData, requestFor, nationalIdFile])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length, isStepValid])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }, [currentStep])

  // Reset form when modal closes
  const resetForm = useCallback(() => {
    setCurrentStep(1)
    setRequestFor("self")
    setFormData({
      disability: "",
      serviceType: "",
      issueDescription: "",
      urgency: "medium",
      preferredContact: "email",
      additionalNotes: "",
      selfSex: "",
      selfRegion: "",
      selfCity: "",
      selfSubCity: "",
      selfKebele: "",
      selfAge: "",
      firstName: "",
      lastName: "",
      sex: "",
      region: "",
      city: "",
      subCity: "",
      kebele: "",
      age: "",
      phoneNumber1: "",
      phoneNumber2: ""
    })
    setNationalIdFile(null)
    setDisabilityCardFile(null)
    setDisabilityAuthFile(null)
    setOtherFile(null)
    setIsSubmitting(false) // Reset submitting state
    isSubmittingRef.current = false // Reset ref
    // Reset file inputs
    if (nationalIdInputRef.current) nationalIdInputRef.current.value = ''
    if (disabilityCardInputRef.current) disabilityCardInputRef.current.value = ''
    if (disabilityAuthInputRef.current) disabilityAuthInputRef.current.value = ''
    if (otherFileInputRef.current) otherFileInputRef.current.value = ''
  }, [])

  // Reset form when modal closes (only when open changes from true to false)
  useEffect(() => {
    if (!open) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]) // Only depend on 'open' to avoid infinite loops

  const handleFileChange = useCallback((type: 'nationalId' | 'disabilityCard' | 'disabilityAuth' | 'other', e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validate file size (max 40MB per file)
      if (file.size > 40 * 1024 * 1024) {
        toast({
          title: t('filesTooLarge') || "File Too Large",
          description: "Maximum file size is 40MB per file.",
          variant: "destructive",
        })
        return;
      }

      if (type === 'nationalId') {
        setNationalIdFile(file)
      } else if (type === 'disabilityCard') {
        setDisabilityCardFile(file)
      } else if (type === 'disabilityAuth') {
        setDisabilityAuthFile(file)
      } else if (type === 'other') {
        setOtherFile(file)
      }
    }
  }, [t])

  const removeFile = useCallback((type: 'nationalId' | 'disabilityCard' | 'disabilityAuth' | 'other') => {
    if (type === 'nationalId') {
      setNationalIdFile(null)
      if (nationalIdInputRef.current) nationalIdInputRef.current.value = ''
    } else if (type === 'disabilityCard') {
      setDisabilityCardFile(null)
      if (disabilityCardInputRef.current) disabilityCardInputRef.current.value = ''
    } else if (type === 'disabilityAuth') {
      setDisabilityAuthFile(null)
      if (disabilityAuthInputRef.current) disabilityAuthInputRef.current.value = ''
    } else if (type === 'other') {
      setOtherFile(null)
      if (otherFileInputRef.current) otherFileInputRef.current.value = ''
    }
  }, [])

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

  const handleSubmit = useCallback(() => {
    // Prevent double submission using ref (more reliable than state)
    if (isSubmittingRef.current || isSubmitting) {
      return
    }

    if (!isStepValid(currentStep)) {
      return
    }

    // Set both state and ref to prevent double submission
    isSubmittingRef.current = true
    setIsSubmitting(true)

    // Transform form data to match API structure
    const apiData: any = {
      priority: formData.urgency,
      disability_type: formData.disability,
      service_type: formData.serviceType,
      description: formData.issueDescription,
      contact_method: formData.preferredContact,
      remarks: formData.additionalNotes || undefined, // Only include if not empty
      is_confidential: false,
      request_for: requestFor
    }

    // Add self details if request is for self
    if (requestFor === "self") {
      apiData.sex = formData.selfSex
      apiData.region = formData.selfRegion
      apiData.city = formData.selfCity
      apiData.sub_city = formData.selfSubCity
      apiData.kebele = formData.selfKebele
      apiData.age = formData.selfAge ? parseInt(formData.selfAge) : null
    }

    // Add other person details if request is for other person
    if (requestFor === "other") {
      // Combine first name and last name into other_name
      apiData.other_name = `${formData.firstName} ${formData.lastName}`.trim()
      apiData.other_sex = formData.sex
      apiData.other_region = formData.region
      apiData.other_city = formData.city
      apiData.other_subcity = formData.subCity
      apiData.other_kebele = formData.kebele
      apiData.other_age = formData.age ? parseInt(formData.age) : null
      // Use phone_number_1 as other_phone, or combine both if phone_number_2 exists
      apiData.other_phone = formData.phoneNumber2
        ? `${formData.phoneNumber1}, ${formData.phoneNumber2}`.trim()
        : formData.phoneNumber1
    }

    // Validate required files
    if (!nationalIdFile) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
      toast({
        title: t('nationalIdRequired') || "Government issued identification is required",
        description: "Please upload your government issued identification document.",
        variant: "destructive",
      })
      return;
    }

    // Validate that required fields are not empty
    if (!formData.disability || !formData.serviceType || !formData.issueDescription) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
      toast({
        title: t('fillRequiredFields') || "Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      })
      return;
    }

    // Combine files in order: National ID, Disability Card, Other (if exists)
    // Titles must match the order of files exactly (first file = first title)
    // API expects: "ID_Card" for first file, "Disability_Card" for second, "Others" for third
    const filesArray: File[] = []
    const titlesArray: string[] = []

    if (nationalIdFile) {
      filesArray.push(nationalIdFile)
      titlesArray.push('ID_Card') // API requires exact format with underscore
    }
    if (disabilityCardFile) {
      filesArray.push(disabilityCardFile)
      titlesArray.push('Disability_Card') // API requires exact format with underscore
    }
    if (disabilityAuthFile) {
      filesArray.push(disabilityAuthFile)
      titlesArray.push('Disability_Authentication') // API requires exact format with underscore
    }
    if (otherFile) {
      filesArray.push(otherFile)
      titlesArray.push('Others') // API expects "Others" for the third file
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug("[Create Request] Submitting data:", apiData)
      console.debug("[Create Request] Files:", filesArray)
      console.debug("[Create Request] Titles:", titlesArray)
    }

    // Pass both data, files, and titles to the parent component
    // Note: isSubmitting will be reset when modal closes via resetForm
    onSubmit?.({ data: apiData, files: filesArray, titles: titlesArray })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, isStepValid, currentStep, formData, requestFor, nationalIdFile, disabilityAuthFile, otherFile, onSubmit, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-[#4082ea] dark:text-blue-400 font-semibold">{t('requestProcess')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('requestProcessDescription') || "Create a new request by filling out the form"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#e7eeff] dark:bg-gray-800 rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border font-medium",
                  currentStep === step.id && "bg-[#4082ea] text-white border-[#4082ea]",
                  currentStep > step.id && "bg-[#4082ea] text-white border-[#4082ea]",
                  currentStep < step.id && "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                )}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm",
                  currentStep >= step.id ? "text-[#4082ea] dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                )}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-300 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-6">
          {/* Step 1 */}
          {currentStep === 1 && (
            <Card className="shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <h3 className="font-semibold text-[#4082ea] dark:text-blue-400">{t('personalInformation')}</h3>

                {/* Request For Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block dark:text-gray-200">{t('requestFor') || "Request For"}</Label>
                  <RadioGroup
                    value={requestFor}
                    onValueChange={(value) => {
                      setRequestFor(value as "self" | "other")
                      // Reset fields when switching between self and other
                      if (value === "self") {
                        setFormData({
                          ...formData,
                          firstName: "",
                          lastName: "",
                          sex: "",
                          region: "",
                          city: "",
                          subCity: "",
                          kebele: "",
                          age: "",
                          phoneNumber1: "",
                          phoneNumber2: ""
                        })
                      } else {
                        setFormData({
                          ...formData,
                          selfSex: "",
                          selfRegion: "",
                          selfCity: "",
                          selfSubCity: "",
                          selfKebele: "",
                          selfAge: ""
                        })
                      }
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="self" id="self" />
                      <Label htmlFor="self" className="font-normal cursor-pointer dark:text-gray-300">
                        {t('forSelf') || "For Myself"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer dark:text-gray-300">
                        {t('forOther') || "For Other Person"}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="dark:text-gray-300">{t('typeOfDisability')} *</Label>
                    <Select
                      value={formData.disability}
                      onValueChange={(value) => setFormData({ ...formData, disability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectDisability')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seeing">{t('seeing')}</SelectItem>
                        <SelectItem value="hearing">{t('hearing')}</SelectItem>
                        <SelectItem value="walking_or_climbing_steps">{t('walkingOrClimbingSteps')}</SelectItem>
                        <SelectItem value="remembering_or_concentrating">{t('rememberingOrConcentrating')}</SelectItem>
                        <SelectItem value="self-Care">{t('selfCare')}</SelectItem>
                        <SelectItem value="communication">{t('communication')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Self Details - Conditional Fields */}
                {requestFor === "self" && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('personalDetails') || "Personal Details"}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('sex') || "Sex"} *</Label>
                        <Select
                          value={formData.selfSex}
                          onValueChange={(value) => setFormData({ ...formData, selfSex: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectSex') || "Select sex"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('male') || "Male"}</SelectItem>
                            <SelectItem value="female">{t('female') || "Female"}</SelectItem>
                            <SelectItem value="other">{t('other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('age') || "Age"} *</Label>
                        <Input
                          type="number"
                          value={formData.selfAge}
                          onChange={(e) => setFormData({ ...formData, selfAge: e.target.value })}
                          placeholder={t('enterAge') || "Enter age"}
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <Label>{t('region') || "Region"} *</Label>
                        <Input
                          value={formData.selfRegion}
                          onChange={(e) => setFormData({ ...formData, selfRegion: e.target.value })}
                          placeholder={t('enterRegion') || "Enter region"}
                        />
                      </div>
                      <div>
                        <Label>{t('city') || "City"} *</Label>
                        <Input
                          value={formData.selfCity}
                          onChange={(e) => setFormData({ ...formData, selfCity: e.target.value })}
                          placeholder={t('enterCity') || "Enter city"}
                        />
                      </div>
                      <div>
                        <Label>{t('subCity') || "Sub City"} *</Label>
                        <Input
                          value={formData.selfSubCity}
                          onChange={(e) => {
                            const value = e.target.value
                            // Reject pure numbers, but allow text with letters (including Amharic) and spaces
                            if (value === '' || !/^\d+$/.test(value)) {
                              setFormData({ ...formData, selfSubCity: value })
                            }
                          }}
                          placeholder={t('enterSubCity') || "Enter sub city"}
                        />
                      </div>
                      <div>
                        <Label>{t('kebeleWoredaZone') || "Sub City/Zone"} *</Label>
                        <Input
                          value={formData.selfKebele}
                          onChange={(e) => {
                            const value = e.target.value
                            // Reject pure numbers, but allow text with letters (including Amharic) and spaces
                            if (value === '' || !/^\d+$/.test(value)) {
                              setFormData({ ...formData, selfKebele: value })
                            }
                          }}
                          placeholder={t('enterKebeleWoredaZone') || "Enter sub city/zone"}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Person Details - Conditional Fields */}
                {requestFor === "other" && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('otherPersonDetails') || "Other Person Details"}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('firstName') || "First Name"} *</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder={t('enterFirstName') || "Enter first name"}
                        />
                      </div>
                      <div>
                        <Label>{t('lastName') || "Last Name"} *</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder={t('enterLastName') || "Enter last name"}
                        />
                      </div>
                      <div>
                        <Label>{t('sex') || "Sex"} *</Label>
                        <Select
                          value={formData.sex}
                          onValueChange={(value) => setFormData({ ...formData, sex: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectSex') || "Select sex"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('male') || "Male"}</SelectItem>
                            <SelectItem value="female">{t('female') || "Female"}</SelectItem>
                            <SelectItem value="other">{t('other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('age') || "Age"} *</Label>
                        <Input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder={t('enterAge') || "Enter age"}
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <Label>{t('region') || "Region"} *</Label>
                        <Input
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          placeholder={t('enterRegion') || "Enter region"}
                        />
                      </div>
                      <div>
                        <Label>{t('city') || "City"} *</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder={t('enterCity') || "Enter city"}
                        />
                      </div>
                      <div>
                        <Label>{t('subCity') || "Sub City"} *</Label>
                        <Input
                          value={formData.subCity}
                          onChange={(e) => {
                            const value = e.target.value
                            // Reject pure numbers, but allow text with letters (including Amharic) and spaces
                            if (value === '' || !/^\d+$/.test(value)) {
                              setFormData({ ...formData, subCity: value })
                            }
                          }}
                          placeholder={t('enterSubCity') || "Enter sub city"}
                        />
                      </div>
                      <div>
                        <Label>{t('kebeleWoredaZone') || "Sub City/Zone"} *</Label>
                        <Input
                          value={formData.kebele}
                          onChange={(e) => {
                            const value = e.target.value
                            // Reject pure numbers, but allow text with letters (including Amharic) and spaces
                            if (value === '' || !/^\d+$/.test(value)) {
                              setFormData({ ...formData, kebele: value })
                            }
                          }}
                          placeholder={t('enterKebeleWoredaZone') || "Enter sub city/zone"}
                        />
                      </div>
                      <div>
                        <Label>{t('phoneNumber1') || "Phone Number 1"} *</Label>
                        <Input
                          type="tel"
                          value={formData.phoneNumber1}
                          onChange={(e) => setFormData({ ...formData, phoneNumber1: e.target.value })}
                          placeholder={t('enterPhoneNumber1') || "+251900000000"}
                        />
                      </div>
                      <div>
                        <Label>{t('phoneNumber2') || "Phone Number 2"}</Label>
                        <Input
                          type="tel"
                          value={formData.phoneNumber2}
                          onChange={(e) => setFormData({ ...formData, phoneNumber2: e.target.value })}
                          placeholder={t('enterPhoneNumber2') || "+251900000000"}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <Card className="shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <h3 className="font-semibold text-[#4082ea] dark:text-blue-400">{t('serviceDetails')}</h3>
                <div>
                  <Label className="dark:text-gray-300">{t('serviceType')} *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectServiceType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inperson_conusltation">{t('inpersonConsultation')}</SelectItem>
                      <SelectItem value="phone">{t('phoneConsultation') || t('phoneService')}</SelectItem>
                      <SelectItem value="court_apperance">{t('courtAppearanceRepresentation') || t('courtAppearance')}</SelectItem>
                      <SelectItem value="hotline">{t('hotline')}</SelectItem>
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
                {/* National ID Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-300">
                    {t('nationalId')} *
                  </Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-[#e7eeff] dark:hover:bg-blue-900/20 border-[#4082ea]/50 dark:border-blue-500/50 transition-colors"
                    onClick={() => nationalIdInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={nationalIdInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange('nationalId', e)}
                      accept="*/*"
                    />
                    {nationalIdFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="mr-2 flex-shrink-0">{getFileIcon(nationalIdFile)}</span>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{nationalIdFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(nationalIdFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile('nationalId')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-[#4082ea] dark:text-blue-400" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('uploadNationalId')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 40MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Disability Card Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-300">
                    {t('disabilityCard')} <span className="text-gray-400 dark:text-gray-500 text-xs">({tCommon('optional')})</span>
                  </Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-[#e7eeff] dark:hover:bg-blue-900/20 border-[#4082ea]/50 dark:border-blue-500/50 transition-colors"
                    onClick={() => disabilityCardInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={disabilityCardInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange('disabilityCard', e)}
                      accept="*/*"
                    />
                    {disabilityCardFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="mr-2 flex-shrink-0">{getFileIcon(disabilityCardFile)}</span>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{disabilityCardFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(disabilityCardFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile('disabilityCard')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-[#4082ea] dark:text-blue-400" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('uploadDisabilityCard')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 40MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Disability Authentication Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('disabilityAuthentication')} <span className="text-gray-400 text-xs">({tCommon('optional')})</span>
                  </Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-[#e7eeff] border-[#4082ea]/50 transition-colors"
                    onClick={() => disabilityAuthInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={disabilityAuthInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange('disabilityAuth', e)}
                      accept="*/*"
                    />
                    {disabilityAuthFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="mr-2 flex-shrink-0">{getFileIcon(disabilityAuthFile)}</span>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">{disabilityAuthFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(disabilityAuthFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile('disabilityAuth')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-[#4082ea]" size={24} />
                        <p className="text-sm text-gray-600">{t('uploadDisabilityAuthentication')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('disabilityAuthenticationDescription')}</p>
                        <p className="text-xs text-gray-400 mt-1">Max 40MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Other Document Upload (Optional) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t('otherDocument')} <span className="text-gray-400 dark:text-gray-500 text-xs">({tCommon('optional')})</span>
                  </Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-[#e7eeff] dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 transition-colors"
                    onClick={() => otherFileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={otherFileInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange('other', e)}
                      accept="*/*"
                    />
                    {otherFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="mr-2 flex-shrink-0">{getFileIcon(otherFile)}</span>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{otherFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(otherFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile('other')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-gray-400 dark:text-gray-500" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('uploadOtherDocument')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 40MB</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <Card className="shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-[#4082ea] dark:text-blue-400 mb-4">{t('additionalInformation')}</h3>

                <div>
                  <Label className="dark:text-gray-300">{t('urgencyLevel')}</Label>
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
                  <Label className="dark:text-gray-300">{t('preferredContactMethod')}</Label>
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
                  <Label className="dark:text-gray-300">{t('additionalNotes')}</Label>
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
                      <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                        {t('confirmInformationAccurate')}
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">
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
              className="border-[#4082ea] text-[#4082ea] hover:bg-[#4082ea]/10 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10"
            >
              {tCommon('previous')}
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1] dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              {tCommon('next')}
            </Button>
          ) : (
            <Button
              className="bg-[#4082ea] hover:bg-[#306ad1] dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
            >
              {isSubmitting ? tCommon('loading') || "Submitting..." : tCommon('submit')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
