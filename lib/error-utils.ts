/**
 * Get user-friendly error message from HTTP error code
 * @param error - The error object
 * @param t - Optional translation function (e.g., from useTranslations('errors'))
 */
export function getErrorMessage(error: any, t?: (key: string) => string): string {
  // If error has a response with status code
  if (error?.response?.status) {
    const status = error.response.status
    
    // Check if there's a custom message from the backend
    const backendMessage = error.response.data?.message || error.response.data?.error?.message
    
    // If backend provides a message, use it (but make it user-friendly if it's just a code)
    if (backendMessage && !backendMessage.match(/^\d{3}$/)) {
      return backendMessage
    }
    
    // Map status codes to user-friendly messages
    if (t) {
      switch (status) {
        case 400:
          return t('invalidRequest')
        case 401:
          return t('authenticationError')
        case 403:
          return t('accessDenied')
        case 404:
          return t('resourceNotFound')
        case 409:
          return t('conflict')
        case 422:
          return t('validationError')
        case 429:
          return t('tooManyRequests')
        case 500:
          return t('serverError')
        case 502:
          return t('badGateway')
        case 503:
          return t('serviceUnavailable')
        case 504:
          return t('gatewayTimeout')
        default:
          return t('requestFailed').replace('{status}', status.toString())
      }
    }
    
    // Fallback to English if no translation function provided
    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again."
      case 401:
        return "Authentication error. Please log in again."
      case 403:
        return "Access denied. You don't have permission to perform this action."
      case 404:
        return "Resource not found. The requested item may have been deleted or moved."
      case 409:
        return "Conflict. This resource already exists or has been modified."
      case 422:
        return "Validation error. Please check your input and try again."
      case 429:
        return "Too many requests. Please wait a moment and try again."
      case 500:
        return "Server error. Please try again later or contact support."
      case 502:
        return "Bad gateway. The server is temporarily unavailable."
      case 503:
        return "Service unavailable. The server is temporarily down for maintenance."
      case 504:
        return "Gateway timeout. The request took too long. Please try again."
      default:
        return `Request failed with error ${status}. Please try again.`
    }
  }
  
  // Handle network errors
  if (error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")) {
    return t ? t('timeoutError') : "Request timed out. Please check your connection and try again."
  }
  
  if (error?.code === "ERR_NETWORK" || error?.message?.toLowerCase().includes("network")) {
    return t ? t('networkError') : "Network error. Please check your internet connection."
  }
  
  // Handle error messages
  if (error?.message) {
    // If message is just a status code, convert it
    if (error.message.match(/^\d{3}$/)) {
      return getErrorMessage({ response: { status: parseInt(error.message) } }, t)
    }
    return error.message
  }
  
  // Default fallback
  return t ? t('unexpectedError') : "An unexpected error occurred. Please try again."
}

/**
 * Get user-friendly error title from HTTP error code
 * @param error - The error object
 * @param t - Optional translation function (e.g., from useTranslations('errors'))
 */
export function getErrorTitle(error: any, t?: (key: string) => string): string {
  if (error?.response?.status) {
    const status = error.response.status
    
    if (t) {
      switch (status) {
        case 400:
          return t('invalidRequestTitle')
        case 401:
          return t('authenticationErrorTitle')
        case 403:
          return t('accessDeniedTitle')
        case 404:
          return t('notFoundTitle')
        case 409:
          return t('conflictTitle')
        case 422:
          return t('validationErrorTitle')
        case 429:
          return t('tooManyRequestsTitle')
        case 500:
          return t('serverErrorTitle')
        case 502:
          return t('badGatewayTitle')
        case 503:
          return t('serviceUnavailableTitle')
        case 504:
          return t('gatewayTimeoutTitle')
        default:
          return t('errorTitle')
      }
    }
    
    // Fallback to English if no translation function provided
    switch (status) {
      case 400:
        return "Invalid Request"
      case 401:
        return "Authentication Error"
      case 403:
        return "Access Denied"
      case 404:
        return "Not Found"
      case 409:
        return "Conflict"
      case 422:
        return "Validation Error"
      case 429:
        return "Too Many Requests"
      case 500:
        return "Server Error"
      case 502:
        return "Bad Gateway"
      case 503:
        return "Service Unavailable"
      case 504:
        return "Gateway Timeout"
      default:
        return "Error"
    }
  }
  
  if (error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")) {
    return t ? t('requestTimeoutTitle') : "Request Timeout"
  }
  
  if (error?.code === "ERR_NETWORK" || error?.message?.toLowerCase().includes("network")) {
    return t ? t('networkErrorTitle') : "Network Error"
  }
  
  return t ? t('errorTitle') : "Error"
}

