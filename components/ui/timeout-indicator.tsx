import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TimeoutIndicatorProps {
  error?: any
  onRetry?: () => void
  className?: string
}

export function TimeoutIndicator({ error, onRetry, className = "" }: TimeoutIndicatorProps) {
  const isTimeout = error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")
  const isNetworkError = error?.code === "ERR_NETWORK" || error?.message?.toLowerCase().includes("network")
  
  if (!isTimeout && !isNetworkError) {
    return null
  }

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            {isTimeout && (
              <p className="font-medium">Request timed out</p>
            )}
            {isNetworkError && (
              <p className="font-medium">Network error</p>
            )}
            <p className="text-sm mt-1">
              {isTimeout 
                ? "The request is taking longer than expected. Please check your connection."
                : "Unable to connect to the server. Please check your internet connection."
              }
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
