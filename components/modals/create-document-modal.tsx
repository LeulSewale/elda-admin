"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type UploadDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const documentCategories = [
  "LLC",
  "Legal Document",
  "Financial Record",
  "Other"
]

export function UploadDocumentModal({ open, onOpenChange }: UploadDocumentModalProps) {
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [documentCategory, setDocumentCategory] = useState<string>("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setAttachedFiles([files[0]])
    }
  }

  const handleRemoveFile = () => {
    setAttachedFiles([])
  }

  const isFormValid = documentTitle.trim() !== "" && documentCategory !== "" && attachedFiles.length > 0;

  const handleFinish = () => {
    // This is where you would typically handle the actual upload logic
    console.log("Submitting:", { documentTitle, documentCategory, attachedFile: attachedFiles[0]?.name });
    
    // For this example, we'll simulate a successful upload
    setIsSuccess(true);
    
    // You can also add a timer to automatically close the modal after a few seconds
    // setTimeout(() => {
    //   setIsSuccess(false);
    //   onOpenChange(false);
    // }, 3000);
  };
  
  const handleClose = () => {
    // Reset state when the modal is closed
    setDocumentTitle("");
    setDocumentCategory("");
    setAttachedFiles([]);
    setIsSuccess(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {!isSuccess ? (
          <>
            <div className="flex items-center gap-2 p-6 border-b">
              <Upload className="w-5 h-5 text-blue-500" />
              <DialogTitle className="text-base font-semibold">Upload New Document</DialogTitle>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="documentTitle" className="text-sm font-medium text-gray-700">Document Title</label>
                  <Input
                    id="documentTitle"
                    placeholder="LLC"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="documentCategory" className="text-sm font-medium text-gray-700">Document Category</label>
                  <Select
                    value={documentCategory}
                    onValueChange={setDocumentCategory}
                  >
                    <SelectTrigger id="documentCategory">
                      <SelectValue placeholder="LLC" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload File</label>
                <div className="relative flex items-center justify-center p-12 border border-gray-300 border-dashed rounded-lg bg-gray-50">
                  {attachedFiles.length === 0 ? (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 mb-2 text-gray-400" />
                      <div className="flex flex-col items-center text-sm text-gray-500">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Click to upload</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="mt-1">or drag and drop PDF,DOCX,PNG files</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{attachedFiles[0].name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button type="button" variant="outline" onClick={handleClose} className="px-6">
                Back
              </Button>
              <Button 
                type="button" 
                className="px-6 bg-blue-600 hover:bg-blue-700"
                disabled={!isFormValid}
                onClick={handleFinish}
              >
                Finish
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-500">Your document has been uploaded successfully.</p>
            <Button
              type="button"
              className="mt-6 px-6 bg-blue-600 hover:bg-blue-700"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}