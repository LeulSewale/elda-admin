"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { FolderOpen, Download } from "lucide-react"
import { Document } from "@/lib/api/docThreads"

// Type declaration for File System Access API
// Note: FileSystemDirectoryHandle and FileSystemFileHandle are already defined in TypeScript's DOM types
// We only need to extend them with additional methods if needed
declare global {
  interface FileSystemWritableFileStream extends WritableStream {
    write(data: Blob | string): Promise<void>
    close(): Promise<void>
  }
  
  function showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
}

interface DownloadDestinationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onDownload: (destination: FileSystemDirectoryHandle | null) => void
  isLoading?: boolean
}

// Check if File System Access API is supported
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in globalThis
}

export function DownloadDestinationDialog({ 
  open, 
  onOpenChange, 
  document, 
  onDownload, 
  isLoading = false 
}: DownloadDestinationDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [useDefaultLocation, setUseDefaultLocation] = useState(true)
  const [isSelectingFolder, setIsSelectingFolder] = useState(false)

  const handleSelectFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      alert("Folder selection is not supported in your browser. Please use a modern browser like Chrome or Edge.")
      return
    }

    try {
      setIsSelectingFolder(true)
      const directoryHandle = await (globalThis as any).showDirectoryPicker({
        mode: 'readwrite'
      })
      setSelectedFolder(directoryHandle)
      setUseDefaultLocation(false)
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error)
        alert("Failed to select folder. Please try again.")
      }
    } finally {
      setIsSelectingFolder(false)
    }
  }

  const handleDownload = () => {
    if (useDefaultLocation) {
      onDownload(null)
    } else {
      onDownload(selectedFolder)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setSelectedFolder(null)
      setUseDefaultLocation(true)
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">{getFileIcon(document.mime_type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {document.title || document.original_name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(document.size)} • {document.mime_type}
              </p>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Choose Download Location</Label>
            
            {/* Default Location Option */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="default-location"
                name="download-location"
                checked={useDefaultLocation}
                onChange={() => setUseDefaultLocation(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <Label htmlFor="default-location" className="flex items-center gap-2 cursor-pointer">
                <FolderOpen className="h-4 w-4 text-gray-500" />
                <span>Use default download folder</span>
                <span className="text-sm text-gray-500">(Browser's default location)</span>
              </Label>
            </div>

            {/* Custom Location Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="custom-location"
                  name="download-location"
                  checked={!useDefaultLocation}
                  onChange={() => setUseDefaultLocation(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Label htmlFor="custom-location" className="cursor-pointer">
                  Choose custom location
                </Label>
              </div>

              {/* Folder Selection Button */}
              {!useDefaultLocation && (
                <div className="ml-7 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectFolder}
                    disabled={isSelectingFolder || !isFileSystemAccessSupported()}
                    className="w-full justify-start"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {isSelectingFolder 
                      ? "Selecting folder..." 
                      : selectedFolder 
                        ? `Selected: ${selectedFolder.name}` 
                        : "Select folder"}
                  </Button>
                  {selectedFolder && (
                    <p className="text-xs text-gray-500">
                      File will be saved to: <span className="font-mono">{selectedFolder.name}</span>
                    </p>
                  )}
                  {!isFileSystemAccessSupported() && (
                    <p className="text-xs text-yellow-600">
                      Folder selection is not supported in your browser. Please use Chrome or Edge.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isLoading || (!useDefaultLocation && !selectedFolder)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions (same as in document-utils.ts)
const getFileIcon = (mimeType: string): string => {
  if (mimeType?.includes("pdf")) return "📄"
  if (mimeType?.includes("image")) return "🖼️"
  if (mimeType?.includes("word") || mimeType?.includes("document")) return "📝"
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) return "📊"
  return "📁"
}

const formatFileSize = (size: string): string => {
  const bytes = parseInt(size)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
