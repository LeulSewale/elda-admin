'use client'
  
  import { useForm as useReactHookForm } from "react-hook-form"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import Link from "next/link"
  import { useRouter } from "next/navigation"
  import { useMutation } from "@tanstack/react-query"
  import { authApi } from "@/lib/api/auth"
  import { toast } from "@/hooks/use-toast"
  import logo from "../../public/tele_tender.png"
  import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
  import { useState } from "react"
  import Image from "next/image"
  
  export default function SignupPageClient() {
  const router = useRouter()
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; phone: string; password: string; role: string }) => 
      authApi.register(userData),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Account created successfully. You can now log in.",
        duration: 3000,
      })
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Registration failed",
        variant: "destructive",
        duration: 3000,
      })
    },
  })
  
      const form = useReactHookForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: any) => {
    const userData = {
      name: values.fullName,
      email: values.email,
      phone: values.phoneNumber,
      password: values.password,
      role: "user" // Always set role to "user" for signup
    }
    
    registerMutation.mutate(userData)
  }
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
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
              <h1 className="text-6xl font-bold text-[#A4D65E]">ELDA SYSTEM</h1>
            </div>
          </div>
                     {/* Right side - Register Form */}
           <div className="w-full max-w-lg lg:max-w-2xl mx-auto">
             <Card className="bg-gradient-to-br from-white via-[#f6ffe8] to-[#e8f7d4] shadow-md rounded-xl lg:rounded-2xl border-0 transition-transform duration-300 hover:scale-[1.02] animate-fade-in">
                               <CardHeader className="text-center px-4 lg:px-6">
                  <CardTitle className="text-2xl lg:text-3xl text-[#A4D65E] font-extrabold tracking-tight">ELDA SYSTEM</CardTitle>
                  <div className="mt-2 text-gray-500 text-base lg:text-lg font-medium">Create your user account</div>
                  <div className="mt-1 text-gray-400 text-xs lg:text-sm">Join the ELDA system to manage your requests and tickets</div>
                </CardHeader>
               <div className="border-b border-gray-200 mx-4 lg:mx-6 mb-4 lg:mb-6" />
               <CardContent className="space-y-4 lg:space-y-6 px-4 lg:px-6">
                                 <Form {...form}>
                   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     {/* First four fields in two columns */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                       <FormField
                         control={form.control}
                         name="fullName"
                         rules={{ required: "Full name is required" }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Full Name</FormLabel>
                             <FormControl>
                               <Input
                                 type="text"
                                 placeholder="Enter your full name"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="phoneNumber"
                         rules={{ 
                           required: "Phone number is required",
                           pattern: {
                             value: /^(\+251|251|0)(9\d{8}|7\d{8})$/,
                             message: "Please enter a valid Ethiopian phone number (e.g., +251912345678, 251912345678, 0912345678, 0712345678)"
                           }
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Phone Number</FormLabel>
                             <FormControl>
                               <Input
                                 type="tel"
                                 placeholder="Enter Ethiopian phone number"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="email"
                         rules={{
                           required: "Email is required",
                           pattern: {
                             value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                             message: "Please enter a valid email address",
                           },
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Email Address</FormLabel>
                             <FormControl>
                               <Input
                                 type="email"
                                 placeholder="Enter your email address"
                                 disabled={registerMutation.isPending}
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
                                 placeholder="Enter password"
                                 disabled={registerMutation.isPending}
                                 {...field}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-10 lg:h-12 bg-[#A4D65E] hover:bg-[#8FCB4A] text-white text-sm lg:text-base"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-xs lg:text-sm text-gray-600">
                  {"Already have an account? "}
                  <Link href="/login" className="text-[#A4D65E] hover:underline font-semibold">
                    Login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } 