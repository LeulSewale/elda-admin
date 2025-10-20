"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { toast } from "@/hooks/use-toast"

export default function AuthDebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      console.log("=== AUTH DEBUG START ===")
      
      // Check cookies
      const cookies = document.cookie
      const cookieList = cookies.split(';').map(c => c.trim())
      
      const debugData = {
        cookies,
        cookieList,
        hasAccessToken: cookieList.some(c => c.includes('access_token')),
        hasRefreshToken: cookieList.some(c => c.includes('refresh_token')),
        timestamp: new Date().toISOString()
      }
      
      console.log("Cookie Debug:", debugData)
      setDebugInfo(debugData)
      
      // Try to call the me endpoint
      try {
        const response = await authApi.me()
        console.log("Auth API Response:", response.data)
        toast({
          title: "Success",
          description: "Authentication successful!",
        })
      } catch (error: any) {
        console.error("Auth API Error:", error)
        console.error("Error Status:", error?.response?.status)
        console.error("Error Data:", error?.response?.data)
        
        toast({
          title: "Authentication Failed",
          description: `Status: ${error?.response?.status} - ${error?.response?.data?.message || error?.message}`,
          variant: "destructive",
        })
      }
      
      console.log("=== AUTH DEBUG END ===")
    } catch (error) {
      console.error("Debug Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAuthData = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    toast({
      title: "Cleared",
      description: "All authentication data cleared",
    })
    
    setDebugInfo(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={checkAuthStatus} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Checking..." : "Check Auth Status"}
              </Button>
              
              <Button 
                onClick={clearAuthData}
                variant="destructive"
              >
                Clear All Auth Data
              </Button>
            </div>
            
            {debugInfo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Quick Fixes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• If no cookies: You need to log in first</li>
                <li>• If cookies exist but 401: Backend authentication issue</li>
                <li>• If network error: Check backend server is running</li>
                <li>• If CORS error: Backend CORS configuration issue</li>
              </ul>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click "Check Auth Status" to see current state</li>
                <li>2. If no cookies, go to <a href="/login" className="underline">/login</a> to log in</li>
                <li>3. If cookies exist but still 401, check backend logs</li>
                <li>4. Use "Clear All Auth Data" to start fresh</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
