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
  import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
  import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { usePathname } from 'next/navigation'
import { getCurrentLocaleFromPath } from '@/lib/language-utils'
  
export default function SignupPageClient() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = getCurrentLocaleFromPath(pathname)
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; phone: string; password: string; role: string }) => 
      authApi.register(userData),
    onSuccess: (response) => {
      toast({
        title: tCommon('success'),
        description: t('signupSuccess') || "Account created successfully. You can now log in.",
        duration: 3000,
      })
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    },
    onError: (error: any) => {
      toast({
        title: tCommon('error'),
        description: error?.response?.data?.message || error?.message || t('signupError') || "Registration failed",
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
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
  
          <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <Logo
                  src="/elda-logo.png"
                  alt="ELDA Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-xl"
                  fallbackText="ELDA"
                />
              </div>
              <h1 className="text-6xl font-bold text-blue-500">ELDA SYSTEM</h1>
            </div>
          </div>
                     {/* Right side - Register Form */}
           <div className="w-full max-w-lg lg:max-w-2xl mx-auto">
             <Card className="bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-md rounded-xl lg:rounded-2xl border-0 transition-transform duration-300 hover:scale-[1.02] animate-fade-in">
                               <CardHeader className="text-center px-4 lg:px-6">
                  <CardTitle className="text-2xl lg:text-3xl text-blue-500 font-extrabold tracking-tight">ELDA SYSTEM</CardTitle>
                  <div className="mt-2 text-gray-500 text-base lg:text-lg font-medium">{t('signupTitle')}</div>
                  <div className="mt-1 text-gray-400 text-xs lg:text-sm">{t('signupSubtitle')}</div>
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
                         rules={{ required: tValidation('required') }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>{tCommon('name')}</FormLabel>
                             <FormControl>
                               <Input
                                 type="text"
                                 placeholder={tCommon('name')}
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
                           required: tValidation('required'),
                           pattern: {
                             value: /^(\+251|251|0)(9\d{8}|7\d{8})$/,
                             message: tValidation('phoneInvalid')
                           }
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>{tCommon('phone')}</FormLabel>
                             <FormControl>
                               <Input
                                 type="tel"
                                 placeholder={tCommon('phone')}
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
                           required: tValidation('required'),
                           pattern: {
                             value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                             message: tValidation('emailInvalid'),
                           },
                           validate: {
                             notEmpty: (value) => value.trim().length > 0 || tValidation('required'),
                             hasAtSymbol: (value) => value.includes('@') || tValidation('emailInvalid'),
                             hasDomain: (value) => {
                               const parts = value.split('@');
                               return parts.length === 2 && parts[1].includes('.') || tValidation('emailInvalid');
                             },
                             validLength: (value) => {
                               const parts = value.split('@');
                               return parts[0].length >= 1 && parts[0].length <= 64 && parts[1].length >= 3 && parts[1].length <= 253 || tValidation('emailInvalid');
                             }
                           }
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>{tCommon('email')}</FormLabel>
                             <FormControl>
                               <Input
                                 type="email"
                                 placeholder={tCommon('email')}
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
                         rules={{ 
                           required: tValidation('required'),
                           minLength: {
                             value: 8,
                             message: tValidation('passwordTooShort')
                           },
                           validate: {
                             hasUpperCase: (value) => /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                             hasLowerCase: (value) => /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                             hasNumber: (value) => /\d/.test(value) || "Password must contain at least one number",
                             hasSpecialChar: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Password must contain at least one special character"
                           }
                         }}
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>{tCommon('password')}</FormLabel>
                             <FormControl>
                               <Input
                                 type="password"
                                 placeholder={tCommon('password')}
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
                      className="w-full h-10 lg:h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm lg:text-base"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? tCommon('loading') : t('signupTitle')}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-xs lg:text-sm text-gray-600">
                  {t('alreadyHaveAccount')}{" "}
                  <Link href={`/${currentLocale}/login`} className="text-blue-500 hover:underline font-semibold">
                    {tCommon('login')}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } 