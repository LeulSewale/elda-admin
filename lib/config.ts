// 📁 lib/config.ts
// Centralized configuration for API endpoints and URLs using environment variables

// Environment variable helpers with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  return process.env[key] || fallback
}

const getEnvNumber = (key: string, fallback: number): number => {
  const value = process.env[key]
  return value ? parseInt(value, 10) : fallback
}

const getEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = process.env[key]
  return value ? value.toLowerCase() === 'true' : fallback
}

// API Configuration from environment variables
const API_BASE_URL = getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'https://elda-backend.onrender.com/api/v1')
const API_HOST = getEnvVar('NEXT_PUBLIC_API_HOST', 'https://elda-backend.onrender.com')
const API_TIMEOUT = getEnvNumber('NEXT_PUBLIC_API_TIMEOUT', 30000)

export const config = {
  // API Configuration
  api: {
    baseUrl: API_BASE_URL,
    host: API_HOST,
    timeout: API_TIMEOUT,
    endpoints: {
      auth: {
        refresh: getEnvVar('NEXT_PUBLIC_AUTH_REFRESH_ENDPOINT', '/auth/refresh'),
        login: getEnvVar('NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT', '/auth/login'),
        logout: getEnvVar('NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT', '/auth/logout'),
      },
      documents: {
        base: getEnvVar('NEXT_PUBLIC_DOCUMENTS_ENDPOINT', '/doc-threads'),
        upload: getEnvVar('NEXT_PUBLIC_DOCUMENTS_UPLOAD_ENDPOINT', '/doc-threads/{threadId}/documents'),
        download: getEnvVar('NEXT_PUBLIC_DOCUMENTS_DOWNLOAD_ENDPOINT', '/doc-threads/{threadId}/documents/{documentId}/download'),
        preview: getEnvVar('NEXT_PUBLIC_DOCUMENTS_PREVIEW_ENDPOINT', '/doc-threads/{threadId}/documents/{documentId}/preview'),
        thumbnail: getEnvVar('NEXT_PUBLIC_DOCUMENTS_THUMBNAIL_ENDPOINT', '/doc-threads/{threadId}/documents/{documentId}/thumbnail'),
      },
      users: {
        base: getEnvVar('NEXT_PUBLIC_USERS_ENDPOINT', '/users'),
      },
      employees: {
        base: getEnvVar('NEXT_PUBLIC_EMPLOYEES_ENDPOINT', '/employees'),
      },
    },
  },
  
  // Document URLs with environment-based configuration
  documents: {
    getDownloadUrl: (downloadPath: string) => {
      // Handle both cases: paths that start with /api/v1/ and those that don't
      if (downloadPath.startsWith('/api/v1/')) {
        return `${API_HOST}${downloadPath}`
      }
      return `${API_BASE_URL}${downloadPath}`
    },
    getPreviewUrl: (previewPath: string) => {
      if (previewPath.startsWith('/api/v1/')) {
        return `${API_HOST}${previewPath}`
      }
      return `${API_BASE_URL}${previewPath}`
    },
    getThumbnailUrl: (thumbnailPath: string) => {
      if (thumbnailPath.startsWith('/api/v1/')) {
        return `${API_HOST}${thumbnailPath}`
      }
      return `${API_BASE_URL}${thumbnailPath}`
    },
  },
  
  // Security Configuration
  security: {
    cookie: {
      secure: getEnvBoolean('NEXT_PUBLIC_COOKIE_SECURE', true),
      sameSite: getEnvVar('NEXT_PUBLIC_COOKIE_SAME_SITE', 'strict') as 'strict' | 'lax' | 'none',
    },
    token: {
      accessTokenExpiryDays: getEnvNumber('NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY_DAYS', 1),
      refreshTokenExpiryDays: getEnvNumber('NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY_DAYS', 7),
    },
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: getEnvNumber('NEXT_PUBLIC_MAX_FILE_SIZE', 10485760), // 10MB
    maxFilesPerUpload: getEnvNumber('NEXT_PUBLIC_MAX_FILES_PER_UPLOAD', 5),
    allowedFileTypes: getEnvVar('NEXT_PUBLIC_ALLOWED_FILE_TYPES', 'pdf,doc,docx,txt,jpg,jpeg,png,gif,webp,xls,xlsx,zip,rar,json,csv').split(','),
  },
  
  // Pagination Configuration
  pagination: {
    defaultPageSize: getEnvNumber('NEXT_PUBLIC_DEFAULT_PAGE_SIZE', 50),
    maxPageSize: getEnvNumber('NEXT_PUBLIC_MAX_PAGE_SIZE', 100),
  },
  
  // Cache Configuration
  cache: {
    staleTime: getEnvNumber('NEXT_PUBLIC_CACHE_STALE_TIME', 300000), // 5 minutes
    gcTime: getEnvNumber('NEXT_PUBLIC_CACHE_GC_TIME', 600000), // 10 minutes
  },
  
  // Environment Configuration
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    debugLogging: getEnvBoolean('NEXT_PUBLIC_ENABLE_DEBUG_LOGGING', true),
    performanceMonitoring: getEnvBoolean('NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING', true),
    errorReporting: getEnvBoolean('NEXT_PUBLIC_ENABLE_ERROR_REPORTING', true),
  },
  
  // App Configuration
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'ELDA Admin'),
    version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  }
} as const

// Type-safe configuration access
export type Config = typeof config
