"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, Send, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FileWithMeta {
  file: File
  title: string
  is_confidential: boolean
}

interface FileUploadAreaProps {
  onUpload: (files: File[], metas?: Array<{ title: string; is_confidential: boolean }>) => void
  isUploading?: boolean
  disabled?: boolean
}

export function FileUploadArea({ onUpload, isUploading = false, disabled = false }: FileUploadAreaProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMeta[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    
    // Validate file count
    if (files.length > 5) {
      toast({
        title: "Too many files",
        description: "Please select maximum 5 files",
        variant: "destructive",
      })
      return
    }
    
    // Validate file sizes (10MB limit per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Please select files smaller than 10MB",
        variant: "destructive",
      })
      return
    }
    
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-rar-compressed',
      'application/json',
      'text/csv'
    ]
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please select PDF, Word, Excel, images, text files, or archives",
        variant: "destructive",
      })
      return
    }
    
    // Add files with default metadata
    const newFiles: FileWithMeta[] = files.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for default title
      is_confidential: false
    }))
    
    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5)) // Max 5 files
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTitleChange = (index: number, title: string) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, title } : item
    ))
  }

  const handleConfidentialChange = (index: number, is_confidential: boolean) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, is_confidential } : item
    ))
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) return
    
    const files = selectedFiles.map(item => item.file)
    const metas = selectedFiles.map(item => ({
      title: item.title.trim() || item.file.name,
      is_confidential: item.is_confidential
    }))
    
    onUpload(files, metas)
    setSelectedFiles([])
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf")) return "📄"
    if (file.type.includes("image")) return "🖼️"
    if (file.type.includes("word") || file.type.includes("document")) return "📝"
    if (file.type.includes("excel") || file.type.includes("spreadsheet")) return "📊"
    if (file.type.includes("zip") || file.type.includes("rar")) return "🗜️"
    return "📁"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="space-y-3">
        {/* File Selection */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.zip,.rar,.json,.csv"
              multiple
              disabled={disabled || isUploading || selectedFiles.length >= 5}
            />
            <label htmlFor="file-upload">
              <Button 
                variant="outline" 
                size="sm" 
                className="p-2 border-blue-300 hover:bg-blue-100" 
                disabled={disabled || isUploading || selectedFiles.length >= 5}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </span>
              </Button>
            </label>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              📁 Choose up to 5 files (PDF, Word, Excel, Images, etc.)
            </div>
            <div className="text-xs text-gray-500">
              {selectedFiles.length}/5 files selected • Max 10MB per file
            </div>
          </div>
        </div>

        {/* File List with Metadata */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              📝 Add titles and metadata for your files:
            </div>
            {selectedFiles.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* File Info Row */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{getFileIcon(item.file)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(item.file.size)}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Metadata Row */}
                <div className="space-y-3">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Document Title (Optional)
                    </label>
                    <Input
                      placeholder={`Enter title for ${item.file.name.split('.')[0]}...`}
                      value={item.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      className="w-full h-9 text-sm"
                      disabled={isUploading}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Leave empty to use filename as title
                    </div>
                  </div>
                  
                  {/* Confidential Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`confidential-${index}`}
                      checked={item.is_confidential}
                      onChange={(e) => handleConfidentialChange(index, e.target.checked)}
                      disabled={isUploading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`confidential-${index}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      🔒 Mark as confidential
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-700">
              <div className="font-medium">Ready to upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</div>
              <div className="text-xs text-gray-500">
                {selectedFiles.filter(f => f.title.trim()).length} with custom titles • 
                {selectedFiles.filter(f => f.is_confidential).length} marked confidential
              </div>
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
