
  "use client"
  
  import { useForm as useReactHookForm } from "react-hook-form"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import logo from "../../public/tele_tender.png"
  import { useAuth } from "@/hooks/use-auth"
  import { toast } from "@/hooks/use-toast"
  import Link from "next/link"
  import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
  import Image from "next/image"
  
  export default function LoginPage() {
    const { login, isAuthenticating } = useAuth({ redirectOnFail: false })
    const form = useReactHookForm({
      defaultValues: {
        phoneNumber: "",
        password: "",
      },
    })
    
  
    const onSubmit = (values: { phoneNumber: string; password: string }) => {
      login(values, {
        onSuccess: () => {
        },
        onError: (error) => {
          let message = "Login failed"
          if (error?.response && typeof error.response.data === "object" && error.response.data !== null && "message" in error.response.data) {
            message = (error.response.data as { message?: string }).message || error?.message || message
          } else if (error?.message) {
            message = error.message
          }
          toast({
            title: "Login Error",
            description: message,
            variant: "destructive",
          })
        },
      })
    }
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left branding panel */}
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
  
          {/* Right form panel */}
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
                <div className="mt-2 text-gray-500 text-sm font-medium">Admin/Company Login</div>
              </CardHeader>
              <div className="border-b border-gray-200 mx-6 mb-4" />
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      rules={{
                        required: "Phone number is required",
                        pattern: {
                          value: /^(\+251|251|0)(9\d{8}|7\d{8})$/,
                          message: "Please enter a valid Ethiopian phone number (e.g., +251912345678, 251912345678, 0912345678, 0712345678)",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter Ethiopian phone number"
                              disabled={isAuthenticating}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      rules={{ required: "Password is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              disabled={isAuthenticating}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                      disabled={isAuthenticating}
                      aria-busy={isAuthenticating}
                    >
                      {isAuthenticating ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-[#A4D65E] hover:underline font-semibold">
                    Sign Up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  