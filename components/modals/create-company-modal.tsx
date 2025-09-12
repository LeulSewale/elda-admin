import { GlobalModal } from "./global-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { companiesApi } from "@/lib/api/companies";
import React, { useState } from "react";
import { Pencil, Eye, EyeOff, Upload, X, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data?: any) => void;
  initialValues?: any;
  editMode?: boolean;
  isLoading?: boolean;
  onSave?: (data: any) => void;
}

function CompanyFormFields({ control, logoPreview, handleLogoChange, isLoading, documents, handleDocumentUpload, removeDocument, editMode, existingLogo, existingDocuments, onLogoRemove, onExistingDocumentRemove }: { 
  control: any, 
  logoPreview: string | null, 
  handleLogoChange: (file: File | null) => void, 
  isLoading?: boolean,
  documents?: File[],
  handleDocumentUpload?: (files: FileList | null) => void,
  removeDocument?: (index: number) => void,
  editMode?: boolean;
  existingLogo?: any;
  existingDocuments?: any[];
  onLogoRemove?: () => void;
  onExistingDocumentRemove?: (index: number) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <>
      {/* Logo Upload with preview and pencil button */}
      <FormField
        control={control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={logoPreview || "/placeholder-user.jpg"}
                  alt="Logo Preview"
                  className="h-28 w-28 object-cover rounded-full border shadow bg-gray-100"
                />
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                    const target = ev.target as HTMLInputElement;
                    handleLogoChange(target.files?.[0] || null);
                  }}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="logo-upload"
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg cursor-pointer border-2 border-white flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4" />
                </Label>
                {/* Remove logo button for edit mode */}
                {editMode && existingLogo && (
                  <button
                    type="button"
                    onClick={onLogoRemove}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg cursor-pointer border border-white"
                    title="Remove logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">Click the pencil to upload company logo</span>
            </div>
          </FormItem>
        )}
      />
      
      {/* Two-column grid for all fields except description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phoneNumber"
          rules={{ 
            required: "Phone number is required",
            pattern: {
              value: /^(\+251|251|0)?[79]\d{8}$/,
              message: "Please enter a valid Ethiopian phone number (e.g., +251912345678, 0912345678)"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="+251912345678 or 0912345678"
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          rules={editMode ? {} : { 
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long"
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password
                {editMode && <span className="text-gray-500 text-sm ml-1">(leave blank to keep current)</span>}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    {...field} 
                    placeholder={editMode ? "Enter new password or leave blank" : "Enter password"}
                    disabled={isLoading} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="country"
          // rules={{ required: "Country is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Description as textarea, full width */}
      <FormField
        control={control}
        name="description"
        // rules={{ required: "Description is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={4} minLength={10} {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Company Documents Upload */}
      <div className="space-y-3">
        <FormLabel className="flex items-center gap-1">
          Company Documents
          {!editMode && <span className="text-red-500">*</span>}
        </FormLabel>
        
        {/* Display existing documents for edit mode */}
        {editMode && existingDocuments && existingDocuments.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Existing Documents:</p>
            <div className="space-y-2">
              {existingDocuments.map((doc: any, index: number) => (
                <div
                  key={doc.id || index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExistingDocumentRemove?.(index)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#A4D65E] transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {editMode ? "Upload additional company documents" : "Upload company documents (PDF, Word, Excel, Images)"}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Maximum 10MB per file. Multiple files allowed.
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              onChange={(e) => handleDocumentUpload?.(e.target.files)}
              disabled={isLoading}
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

        {/* Display newly uploaded documents */}
        {documents && documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">New Documents:</p>
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
                    onClick={() => removeDocument?.(index)}
                    disabled={isLoading}
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
    </>
  )
}

export function CreateCompanyModal({ open, onOpenChange, onSuccess, initialValues, editMode = false, isLoading = false, onSave }: CreateCompanyModalProps) {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(initialValues?.profileImage?.url || null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<Array<{ id: string; publicId: string; type: 'logo' | 'document' }>>([]);
  
  // Track existing files for edit mode
  const [existingLogo, setExistingLogo] = useState<any>(null);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  
  React.useEffect(() => {
    if (open && initialValues?.profileImage?.url) {
      setLogoPreview(initialValues.profileImage.url);
      setExistingLogo(initialValues.profileImage);
    } else if (open) {
      setLogoPreview(null);
      setExistingLogo(null);
    }
  }, [open, initialValues?.profileImage?.url]);
  
  // Track existing documents for edit mode
  React.useEffect(() => {
    if (open && initialValues?.documents && Array.isArray(initialValues.documents)) {
      setExistingDocuments(initialValues.documents);
    } else if (open) {
      setExistingDocuments([]);
    }
  }, [open, initialValues?.documents]);
  
  const form = useReactHookForm({
    defaultValues: {
      name: initialValues?.fullName || "",
      description: initialValues?.description || "",
      phoneNumber: initialValues?.phoneNumber || "",
      email: initialValues?.email || "",
      password: initialValues?.password || "",
      country: initialValues?.address?.country || initialValues?.country || "Ethiopia",
      city: initialValues?.address?.city || initialValues?.city || "",
      logo: null as File | null,
    },
  });

  // Reset form when initialValues change (for edit mode)
  React.useEffect(() => {
    if (initialValues && editMode) {
      form.reset({
        name: initialValues.fullName || "",
        description: initialValues.description || "",
        phoneNumber: initialValues.phoneNumber || "",
        email: initialValues.email || "",
        password: "",
        country: initialValues.address?.country || initialValues.country || "Ethiopia",
        city: initialValues.address?.city || initialValues.city || "",
        logo: null,
      });
      
      // Reset file states
      setLogoPreview(initialValues.profileImage?.url || null);
      setExistingLogo(initialValues.profileImage || null);
      setExistingDocuments(initialValues.documents || []);
      setDeletedFiles([]);
      setDocuments([]);
    }
  }, [initialValues, editMode, form]);

  const isSubmitting = isLoading;

  // Helper for logo preview
  const handleLogoChange = (file: File | null) => {
    form.setValue("logo", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (existingLogo?.url) {
      setLogoPreview(existingLogo.url);
    } else {
      setLogoPreview(null);
    }
  };

  // Handle logo removal (for edit mode)
  const handleLogoRemove = () => {
    if (existingLogo) {
      setDeletedFiles(prev => [...prev, { id: existingLogo.id, publicId: existingLogo.publicId, type: 'logo' }]);
    }
    setExistingLogo(null);
    setLogoPreview(null);
    form.setValue("logo", null);
  };

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

  // Handle existing document removal (for edit mode)
  const removeExistingDocument = (index: number) => {
    const doc = existingDocuments[index];
    if (doc) {
      setDeletedFiles(prev => [...prev, { id: doc.id, publicId: doc.publicId, type: 'document' }]);
      setExistingDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (value: any) => {
    if (editMode && onSave) {
      // For edit mode, pass the deleted files information
      const editData = {
        ...value,
        deletedFiles,
        existingLogo,
        existingDocuments
      };
      onSave(editData);
      return;
    }
    
    // Validate that documents are uploaded (only for create mode)
    if (documents.length === 0 && (!editMode || existingDocuments.length === 0)) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one company document.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    if (value.logo) formData.append("image", value.logo);
    formData.append("fullName", value.name);
    formData.append("description", value.description);
    formData.append("phoneNumber", value.phoneNumber);
    formData.append("email", value.email);
    formData.append("password", value.password);
    formData.append("role", "company");
    formData.append("status", "pending");
    formData.append("address", JSON.stringify({
      country: value.country,
      city: value.city,
    }));
    
    // Append all documents
    documents.forEach((doc) => {
      formData.append('files', doc);
    });
    
    try {
      const response = await companiesApi.createCompanyWithFormData(formData);
      toast({
        title: "Company Created",
        description: `The company '${value.name}' was created successfully!`,
        variant: "default",
      });
      onOpenChange(false);
      form.reset();
      setLogoPreview(null);
      setDocuments([]);
      // Pass the created company data to onSuccess for cache update
      onSuccess(response.data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to create company.",
        variant: "destructive",
      });
    }
  };

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={editMode ? "Edit Company" : "Create New Company"}
      actions={
        <Button
          type="submit"
          form="create-company-form"
          className="bg-[#A4D65E] hover:bg-[#95C653] w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              {editMode ? "Saving..." : "Creating..."}
            </span>
          ) : (
            editMode ? "Save Changes" : "Create Company"
          )}
        </Button>
      }
    >
      <Form {...form}>
        <form
          id="create-company-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-2xl mx-auto p-4 bg-white space-y-6"
        >
          <CompanyFormFields 
            control={form.control} 
            logoPreview={logoPreview} 
            handleLogoChange={handleLogoChange} 
            isLoading={isSubmitting}
            documents={documents}
            handleDocumentUpload={handleDocumentUpload}
            removeDocument={removeDocument}
            // New props for edit mode
            editMode={editMode}
            existingLogo={existingLogo}
            existingDocuments={existingDocuments}
            onLogoRemove={handleLogoRemove}
            onExistingDocumentRemove={removeExistingDocument}
          />
        </form>
      </Form>
    </GlobalModal>
  );
} 