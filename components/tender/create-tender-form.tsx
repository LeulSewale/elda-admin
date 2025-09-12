"use client"
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tendersApi } from "@/lib/api/tenders"
import { companiesApi } from "@/lib/api/companies";
import { categoriesApi } from "@/lib/api/categories"
import { toast } from "@/hooks/use-toast"
import type { Tender} from "@/lib/types"
import { useEffect } from "react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"
import { Upload, X, File, Plus } from "lucide-react"
import { useState } from "react"

interface CreateTenderFormProps {
  onSuccess: () => void
  initialValues?: Partial<Tender>
  editMode?: boolean
  tenderId?: string
}

function getCompanyId(company: unknown): string {
  if (!company) return "";
  if (typeof company === "string") return company;
  if (typeof company === "object" && company !== null && '_id' in company && typeof (company as any)._id === 'string') return (company as any)._id;
  return "";
}

function getCategoryId(category: unknown): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category !== null && '_id' in category && typeof (category as any)._id === 'string') return (category as any)._id;
  return "";
}

function formatDateForInput(date: string | undefined): string {
  if (!date) return "";
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Try to parse and format
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function CreateTenderForm({ onSuccess, initialValues, editMode = false, tenderId }: CreateTenderFormProps) {

  const { user, role } = useAuth();
  const queryClient = useQueryClient()
  const [documents, setDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<Array<{ id: string; publicId: string; name?: string; url?: string }>>([]);
  const [deletedDocuments, setDeletedDocuments] = useState<Array<{ id: string; publicId: string }>>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState("");
  const mutation = useMutation({
    mutationFn: (data: any) =>
      editMode && tenderId ? tendersApi.updateTender(tenderId, data) : tendersApi.createTender(data),
    onSuccess: (newTender) => {
      toast({
        title: editMode ? "Tender updated!" : "Tender created!",
        description: editMode ? "The tender was updated successfully." : "The tender was created successfully.",
      })
      
      // ✅ OPTIMIZED: Targeted cache updates instead of invalidating all queries
      if (editMode && tenderId) {
        // Update existing tender in all relevant caches
        queryClient.setQueriesData(
          { queryKey: ["tenders"] },
          (oldData: any) => {
            if (!oldData?.tenders) return oldData;
            return {
              ...oldData,
              tenders: oldData.tenders.map((tender: any) =>
                (tender._id || tender.id) === tenderId 
                  ? { ...tender, ...newTender?.data || newTender } 
                  : tender
              )
            };
          }
        );
      } else {
        // For new tender, invalidate only the current page to trigger refetch
        queryClient.invalidateQueries({ 
          queryKey: ["tenders"],
          exact: false,
          refetchType: 'active'
        });
      }
      
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || (editMode ? "Failed to update tender." : "Failed to create tender."),
        variant: "destructive",
      })
    },
  })

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.getCompanies({status: "active"}).then(res => res.data.data),
    enabled: role === "admin", // Only fetch companies if admin
  })
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories().then(res => res.data.data),
  })

  const form = useReactHookForm({
    defaultValues: {
      title: initialValues?.title || "",
      company: role === "company" ? (user && typeof user === 'object' && '_id' in user ? (user as any)._id : '') : getCompanyId(initialValues?.company),
      category: getCategoryId(initialValues?.category),
      awardDate: formatDateForInput(initialValues?.awardDate),
      deadline: formatDateForInput(initialValues?.deadline),
      status: initialValues?.status || "open",
      description: initialValues?.description || "",
      documentPrice: initialValues?.documentPrice?.toString() || "",
      requiredDocumentTypes: initialValues?.requiredDocumentTypes || [],
      isCPO: initialValues?.isCPO || false,
      amount: initialValues?.CPO?.amount?.toString() || "",
      bankName: initialValues?.CPO?.bankName || "",
      dueDate: formatDateForInput(initialValues?.CPO?.dueDate),
      accountNumber: initialValues?.CPO?.accountNumber?.toString() || "",
    },
  })

  useEffect(() => {
    if (editMode && initialValues) {
      form.reset({
        title: initialValues.title || "",
        company: role === "company" ? (user && typeof user === 'object' && '_id' in user ? (user as any)._id : '') : getCompanyId(initialValues.company),
        category: getCategoryId(initialValues.category),
        awardDate: formatDateForInput(initialValues.awardDate),
        deadline: formatDateForInput(initialValues.deadline),
        status: initialValues.status || "open",
        description: initialValues.description || "",
        documentPrice: initialValues.documentPrice?.toString() || "",
        requiredDocumentTypes: initialValues.requiredDocumentTypes || [],
        isCPO: initialValues.isCPO || false,
        amount: initialValues.CPO?.amount?.toString() || "",
        bankName: initialValues.CPO?.bankName || "",
        dueDate: formatDateForInput(initialValues.CPO?.dueDate),
        accountNumber: initialValues.CPO?.accountNumber?.toString() || "",
      })
             // Set otherChecked if there's a custom value in the initial data
       setOtherChecked(initialValues.requiredDocumentTypes?.some(v => !['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v)) || false);
       // Seed existing docs
       const docs = ((initialValues as any)?.documents || []) as any[];
       try {
         setExistingDocuments(
           docs.map((d: any) => ({ id: d.id || d._id, publicId: d.publicId, name: d.name, url: d.url }))
         );
       } catch {}
    }
  }, [initialValues, editMode, role, user])

  // Document upload handlers
  const handleDocumentUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
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
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, Word, Excel, or image files.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: any) => {
    // Validate that documents are uploaded
    if (!editMode && documents.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one tender document.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // Append form fields
    formData.append("title", values.title);
    formData.append("company", role === "company" ? (user && typeof user === 'object' && '_id' in user ? (user as any)._id : '') : getCompanyId(values.company));
    formData.append("category", getCategoryId(values.category));
    formData.append("awardDate", values.awardDate);
    formData.append("deadline", values.deadline);
    formData.append("status", values.status);
    formData.append("description", values.description);
    formData.append("documentPrice", values.documentPrice);
    // Append required document types as array
    values.requiredDocumentTypes.forEach((docType: string) => {
      formData.append("requiredDocumentTypes", docType);
    });
    formData.append("isCPO", values.isCPO.toString());
    
    // Append CPO details if enabled
    if (values.isCPO) {
      formData.append("amount", values.amount);
      formData.append("bankName", values.bankName);
      formData.append("dueDate", values.dueDate);
      formData.append("accountNumber", values.accountNumber);
    }
    
    // Append all new documents
    documents.forEach((doc) => {
      formData.append('files', doc);
    });
    // Append deleted document metadata for backend cleanup (edit mode)
    if (editMode && deletedDocuments.length > 0) {
      formData.append('deletedDocuments', JSON.stringify(deletedDocuments));
    }
    mutation.mutate(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {role === "admin" && (
            <FormField
              control={form.control}
              name="company"
              rules={{ required: "Please select a company" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          required
                          disabled={companiesQuery.isLoading}
                        >
                          <SelectTrigger id="company" className="w-full">
                            <SelectValue placeholder={companiesQuery.isLoading ? "Loading..." : "Select company"} />
                          </SelectTrigger>
                          <SelectContent>
                            {companiesQuery.data?.map((c: any) => (
                              <SelectItem key={c.id || c._id} value={c.id || c._id}>{c.fullName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="category"
            rules={{ required: "Please select a category" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Controller
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        required
                        disabled={categoriesQuery.isLoading}
                      >
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder={categoriesQuery.isLoading ? "Loading..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesQuery.data?.map((cat: any) => (
                            <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            rules={{ required: "Deadline is required" }}
            render={({ field }) => {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              const minDeadline = tomorrow.toISOString().slice(0, 10);
              return (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={minDeadline}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="awardDate"
            rules={{
              required: "Award date is required",
              validate: (value: string) => {
                const deadline = form.getValues("deadline");
                if (deadline && value < deadline) {
                  return "Award date must be equal to or after the deadline.";
                }
                // If deadline is not selected, award date must be after today
                if (!deadline) {
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  const minAward = tomorrow.toISOString().slice(0, 10);
                  if (value < minAward) {
                    return "Award date must be in the future.";
                  }
                }
                return true;
              },
            }}
            render={({ field }) => {
              const deadline = form.getValues("deadline");
              let minAward = "";
              if (deadline) {
                minAward = deadline;
              } else {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                minAward = tomorrow.toISOString().slice(0, 10);
              }
              return (
                <FormItem>
                  <FormLabel>Award Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={minAward}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="documentPrice"
            rules={{
              required: "Document price is required",
              validate: (value: string) => isNaN(Number(value)) ? "Must be a number" : true,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Price</FormLabel>
                <FormControl>
                  <Input type="number" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
                     <div className="col-span-full">
             <FormField
               control={form.control}
               name="requiredDocumentTypes"
               rules={{ required: "Required document types are required" }}
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Required Document Types</FormLabel>
                   <FormControl>
                     <Controller
                       control={form.control}
                       name="requiredDocumentTypes"
                       render={({ field }) => (
                         <div className="space-y-2">
                           <div className="grid grid-cols-1 gap-2">
                             {[
                               { value: "national_id", label: "National ID" },
                               { value: "business_license", label: "Business License" },
                               { value: "competency_certificate", label: "Competency Certificate" },
                               { value: "tin_certification", label: "TIN Certification" },
                               { value: "bank_statement", label: "Bank Statement" }
                             ].map((option) => (
                               <div key={option.value} className="flex items-center space-x-2">
                                 <Checkbox
                                   id={option.value}
                                   checked={field.value?.includes(option.value) || false}
                                   onCheckedChange={(checked) => {
                                     const currentValues = field.value || [];
                                     if (checked) {
                                       field.onChange([...currentValues, option.value]);
                                     } else {
                                       field.onChange(currentValues.filter(v => v !== option.value));
                                     }
                                   }}
                                 />
                                 <Label htmlFor={option.value} className="text-sm font-normal">
                                   {option.label}
                                 </Label>
                               </div>
                             ))}
                             <div className="flex items-center space-x-2">
                                                               <Checkbox
                                  id="other"
                                  checked={otherChecked || field.value?.some(v => !['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v)) || false}
                                  onCheckedChange={(checked) => {
                                    setOtherChecked(!!checked);
                                    const currentValues = field.value || [];
                                    if (!checked) {
                                      field.onChange(currentValues.filter(v => ['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v)));
                                      setOtherInputValue("");
                                    }
                                  }}
                                />
                               <Label htmlFor="other" className="text-sm font-normal">
                                 Other
                               </Label>
                             </div>
                           </div>
                                                       {/* Custom other input - only show when other is checked */}
                            {(otherChecked || field.value?.some(v => !['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v))) && (
                             <div className="ml-6 space-y-2">
                               <div className="flex items-center gap-2">
                                 <Input
                                   placeholder="Specify custom document requirement..."
                                   value={otherInputValue}
                                   onChange={(e) => setOtherInputValue(e.target.value)}
                                   className="flex-1"
                                 />
                                 <Button
                                   type="button"
                                   size="sm"
                                                                       onClick={() => {
                                      const trimmedValue = otherInputValue.trim();
                                      if (trimmedValue) {
                                        const currentValues = field.value || [];
                                        field.onChange([...currentValues, trimmedValue]);
                                        setOtherInputValue("");
                                      }
                                    }}
                                   disabled={!otherInputValue.trim()}
                                   className="bg-[#A4D65E] hover:bg-[#8FCB4A] text-white"
                                 >
                                   <Plus className="w-4 h-4" />
                                 </Button>
                               </div>
                                                               {/* Display added custom values */}
                                {field.value?.filter(v => !['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v)).length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-600 font-medium">Added custom requirements:</p>
                                    {field.value
                                      .filter(v => !['national_id', 'business_license', 'competency_certificate', 'tin_certification', 'bank_statement'].includes(v))
                                      .map((customValue, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                          <span className="text-gray-700">{customValue}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentValues = field.value || [];
                                              field.onChange(currentValues.filter(v => v !== customValue));
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                  </div>
                                )}
                             </div>
                           )}
                         </div>
                       )}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
           </div>
        </div>
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isCPO"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Controller
                    control={form.control}
                    name="isCPO"
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={checked => field.onChange(!!checked)}
                      />
                    )}
                  />
                </FormControl>
                <FormLabel>Is CPO?</FormLabel>
              </div>
              {field.value && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <FormField
                    control={form.control}
                    name="amount"
                    rules={{ required: "CPO amount is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPO Amount</FormLabel>
                        <FormControl>
                          <Input type="number" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankName"
                    rules={{ required: "Bank name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    rules={{ required: "CPO due date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPO Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    rules={{ required: "Account number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input type="number" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </FormItem>
          )}
        />
        
        {/* Tender Documents Upload */}
        <div className="space-y-3">
          <FormLabel className="flex items-center gap-1">
            Tender Documents
            <span className="text-red-500">*</span>
          </FormLabel>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#A4D65E] transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload tender documents (PDF, Word, Excel, Images)
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Maximum 10MB per file. Multiple files allowed.
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                onChange={(e) => handleDocumentUpload(e.target.files)}
                disabled={mutation.isPending}
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

          {/* Existing documents (edit mode) */}
          {editMode && existingDocuments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Existing Documents:</p>
              <div className="space-y-2">
                {existingDocuments.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 truncate">
                        {doc.name || doc.publicId?.split('/')?.pop() || 'Document'}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const toRemove = existingDocuments[index];
                        if (toRemove) {
                          setDeletedDocuments((d) => [...d, { id: toRemove.id, publicId: toRemove.publicId }]);
                          setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
                        }
                      }}
                      disabled={mutation.isPending}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      title="Mark for deletion"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly uploaded documents */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      disabled={mutation.isPending}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full h-12 bg-black hover:bg-gray-800 text-white"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Tender" : "Create Tender")}
        </Button>
      </form>
    </Form>
  )
} 