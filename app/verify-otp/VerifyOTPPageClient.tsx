'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/lib/api/auth"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import logo from "../../public/tele_tender.png"

export default function VerifyOTPPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const phoneNumber = searchParams.get('phone')
  const [otp, setOtp] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(60) // 60 seconds OTP expiry countdown

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // OTP expiry countdown timer
  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpExpiry])

  const verifyOTPMutation = useMutation({
    mutationFn: async (otpData: { code: string }) => 
      authApi.verifyOTP(userId!, otpData),
    onSuccess: () => {
      setIsVerified(true)
      toast({
        title: "Success",
        description: "Phone number verified successfully!",
        duration: 3000,
      })
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    },
    onError: (error: any) => {
      // Clear the OTP input when verification fails
      setOtp("")
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "OTP verification failed",
        variant: "destructive",
        duration: 3000,
      })
    },
  })

  const resendOTPMutation = useMutation({
    mutationFn: async () => authApi.resendOTP(userId!),
    onSuccess: () => {
      setCountdown(60) // 60 seconds countdown
      setOtpExpiry(60) // Reset OTP expiry timer
      toast({
        title: "Success",
        description: "OTP resent successfully!",
        duration: 3000,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to resend OTP",
        variant: "destructive",
        duration: 3000,
      })
    },
  })

  const handleVerifyOTP = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try signing up again.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (otp.length !== 4) {
      toast({
        title: "Error",
        description: "Please enter a 4-digit OTP",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    verifyOTPMutation.mutate({ code: otp })
  }

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 4 && !verifyOTPMutation.isPending && !verifyOTPMutation.isError) {
      handleVerifyOTP()
    }
  }, [otp, verifyOTPMutation.isPending])

  const handleResendOTP = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try signing up again.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    resendOTPMutation.mutate()
  }

  if (!userId || !phoneNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Invalid Request</h2>
              <p className="text-gray-600">User ID or phone number not found. Please try signing up again.</p>
              <Button asChild className="w-full">
                <Link href="/signup">Go to Signup</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center">
              <Image
                src={logo}
                alt="Tele Tender Logo"
                width={96}
                height={96}
                className="object-contain drop-shadow-lg"
                style={{ background: 'white', borderRadius: '1.5rem', border: '2px solid #A4D65E', padding: '0.5rem' }}
              />
            </div>
            <h1 className="text-6xl font-bold text-[#A4D65E]">TELE TENDER</h1>
          </div>
        </div>

        {/* Right side - OTP Verification Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-white via-[#f6ffe8] to-[#e8f7d4] shadow-md rounded-2xl border-0 transition-transform duration-300 hover:scale-[1.02] animate-fade-in">
            <CardHeader className="text-center lg:hidden">
              <div className="inline-flex items-center justify-center mb-4">
                <Image
                  src={logo}
                  alt="Tele Tender Logo"
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-lg"
                  style={{ background: 'white', borderRadius: '1rem', border: '2px solid #A4D65E', padding: '0.4rem' }}
                />
              </div>
              <CardTitle className="text-2xl text-[#A4D65E] font-extrabold tracking-tight">TELE TENDER</CardTitle>
              <div className="mt-2 text-gray-500 text-sm font-medium">Verify your phone number</div>
            </CardHeader>
            <div className="border-b border-gray-200 mx-6 mb-4" />
            <CardContent className="space-y-6">
              {isVerified ? (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Verification Successful!</h3>
                  <p className="text-gray-600">Your phone number has been verified. Redirecting to login...</p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                      <div className="text-2xl font-bold text-blue-600">📱</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Verify Your Phone Number</h3>
                      <p className="text-gray-600 mt-2">
                        We've sent a 4-digit verification code to
                      </p>
                      <p className="text-[#A4D65E] font-semibold">{phoneNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-2 text-center">
                       <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                         Enter Verification Code
                       </Label>
                       <div className="flex justify-center">
                         <InputOTP
                           value={otp}
                           onChange={(value) => setOtp(value)}
                           maxLength={4}
                           disabled={verifyOTPMutation.isPending || otpExpiry === 0}
                           className="justify-center"
                           autoFocus
                         >
                           <InputOTPGroup className="gap-3">
                             <InputOTPSlot 
                               index={0} 
                               className="h-12 w-12 text-lg font-semibold border-2 border-gray-300 focus:border-[#A4D65E] focus:ring-2 focus:ring-[#A4D65E]/20" 
                             />
                             <InputOTPSlot 
                               index={1} 
                               className="h-12 w-12 text-lg font-semibold border-2 border-gray-300 focus:border-[#A4D65E] focus:ring-2 focus:ring-[#A4D65E]/20" 
                             />
                             <InputOTPSlot 
                               index={2} 
                               className="h-12 w-12 text-lg font-semibold border-2 border-gray-300 focus:border-[#A4D65E] focus:ring-2 focus:ring-[#A4D65E]/20" 
                             />
                             <InputOTPSlot 
                               index={3} 
                               className="h-12 w-12 text-lg font-semibold border-2 border-gray-300 focus:border-[#A4D65E] focus:ring-2 focus:ring-[#A4D65E]/20" 
                             />
                           </InputOTPGroup>
                         </InputOTP>
                       </div>
                                                {/* OTP Expiry Timer */}
                         <div className="text-center mt-2">
                           {otpExpiry === 0 ? (
                             <p className="text-sm text-red-500 font-medium">
                               OTP has expired. Please resend a new code.
                             </p>
                           ) : (
                             <p className="text-sm text-gray-500">
                               OTP expires in: <span className={`font-semibold ${otpExpiry <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                 {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
                               </span>
                             </p>
                           )}
                         </div>
                     </div>

                                             <Button
                           onClick={handleVerifyOTP}
                           className="w-full h-12 bg-[#A4D65E] hover:bg-[#8FCB4A] text-white"
                           disabled={verifyOTPMutation.isPending || otp.length !== 4 || otpExpiry === 0}
                         >
                           {verifyOTPMutation.isPending ? "Verifying..." : otpExpiry === 0 ? "OTP Expired" : "Verify OTP"}
                         </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        Didn't receive the code?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || resendOTPMutation.isPending}
                        className="text-[#A4D65E] border-[#A4D65E] hover:bg-[#A4D65E] hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {countdown > 0 
                          ? `Resend in ${countdown}s` 
                          : resendOTPMutation.isPending 
                            ? "Sending..." 
                            : "Resend OTP"
                        }
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                      <Link href="/signup" className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Signup
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 