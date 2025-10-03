// 📁 lib/utils/document-utils.ts
// Utility functions for document operations

import { config } from "../config"
import { Document } from "../api/docThreads"
import { api } from "../axios"

/**
 * Downloads a document file with proper file extension handling
 * @param doc - The document object
 * @returns Promise that resolves when download is initiated
 */
export const downloadDocument = async (doc: Document): Promise<void> => {
  try {
    const downloadUrl = config.documents.getDownloadUrl(doc.download_path)
    
    // Get proper file extension from MIME type
    const fileExtension = getFileExtensionFromMimeType(doc.mime_type)
    const fileName = doc.original_name.includes('.') 
      ? doc.original_name 
      : `${doc.original_name}${fileExtension}`
    
    console.log('Download URL:', downloadUrl)
    console.log('File name:', fileName)
    
    // Method 1: Try using axios to get the file with proper authentication
    try {
      const response = await api.get(doc.download_path, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*',
        }
      })
      
      const blob = response.data
      
      // Create blob URL and download
      const blobUrl = globalThis.URL.createObjectURL(blob)
      const link = globalThis.document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.style.display = 'none'
      
      // Ensure download attribute is set
      link.setAttribute('download', fileName)
      
      globalThis.document.body.appendChild(link)
      link.click()
      globalThis.document.body.removeChild(link)
      
      // Clean up blob URL
      globalThis.URL.revokeObjectURL(blobUrl)
      
    } catch (axiosError) {
      // Method 2: Fallback to fetch with cookies
      console.warn('Axios download failed, trying fetch:', axiosError)
      
      try {
        const response = await fetch(downloadUrl, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        
        // Create blob URL and download
        const blobUrl = globalThis.URL.createObjectURL(blob)
        const link = globalThis.document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        link.style.display = 'none'
        
        // Ensure download attribute is set
        link.setAttribute('download', fileName)
        
        globalThis.document.body.appendChild(link)
        link.click()
        globalThis.document.body.removeChild(link)
        
        // Clean up blob URL
        globalThis.URL.revokeObjectURL(blobUrl)
        
      } catch (fetchError) {
        // Method 3: Final fallback to direct link download
        console.warn('Fetch download failed, trying direct link:', fetchError)
        
        const link = globalThis.document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        link.style.display = 'none'
        
        // Add proper attributes to force download
        link.setAttribute('download', fileName)
        link.setAttribute('type', doc.mime_type)
        
        globalThis.document.body.appendChild(link)
        link.click()
        globalThis.document.body.removeChild(link)
      }
    }
    
  } catch (error) {
    console.error('Download failed:', error)
    throw new Error(`Failed to download ${doc.original_name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets file extension from MIME type
 * @param mimeType - The MIME type
 * @returns File extension with dot prefix
 */
export const getFileExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/json': '.json',
    'text/html': '.html',
    'application/xml': '.xml',
    'text/xml': '.xml',
  }
  
  return mimeToExt[mimeType] || ''
}

/**
 * Opens a document preview in a new tab
 * @param doc - The document object
 */
export const previewDocument = (doc: Document): void => {
  const previewUrl = config.documents.getPreviewUrl(doc.preview_path)
  window.open(previewUrl, '_blank')
}

/**
 * Gets the thumbnail URL for a document
 * @param doc - The document object
 * @returns The thumbnail URL
 */
export const getThumbnailUrl = (doc: Document): string => {
  return config.documents.getThumbnailUrl(doc.thumbnail_path)
}

/**
 * Formats file size from string to human readable format
 * @param size - File size as string
 * @returns Formatted file size
 */
export const formatFileSize = (size: string): string => {
  const bytes = parseInt(size)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Gets file type icon based on MIME type
 * @param mimeType - The MIME type of the file
 * @returns Emoji icon for the file type
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType?.includes("pdf")) return "📄"
  if (mimeType?.includes("image")) return "🖼️"
  if (mimeType?.includes("word") || mimeType?.includes("document")) return "📝"
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) return "📊"
  return "📁"
}

/**
 * Gets the display name for a document (title if available, otherwise original_name)
 * @param doc - The document object
 * @returns Display name for the document
 */
export const getDocumentDisplayName = (doc: Document): string => {
  return doc.title && doc.title.trim() !== '' ? doc.title : doc.original_name
}

/**
 * Formats date to relative time (Today, Yesterday, or specific date)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  } else if (diffInHours < 48) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}
