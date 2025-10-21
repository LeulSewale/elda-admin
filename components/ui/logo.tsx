"use client"

import Image from "next/image"
import { useState } from "react"

interface LogoProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  fallbackText?: string
}

export function Logo({ 
  src = "/elda-logo.png", 
  alt = "ELDA Logo", 
  width = 40, 
  height = 40, 
  className = "",
  fallbackText = "ELDA"
}: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-blue-500 text-white font-bold rounded ${className}`}
        style={{ width, height }}
      >
        {fallbackText}
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-contain transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onError={(e) => {
          console.error('[Logo] Image failed to load:', src, e)
          setImageError(true)
        }}
        onLoad={() => {
          console.log('[Logo] Image loaded successfully:', src)
          setImageLoaded(true)
        }}
        priority
        unoptimized={true}
      />
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded ${className}`}
          style={{ width, height }}
        >
          <div className="w-1/2 h-1/2 bg-gray-300 rounded"></div>
        </div>
      )}
    </div>
  )
}
