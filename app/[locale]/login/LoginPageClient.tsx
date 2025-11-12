
"use client"

import { useForm as useReactHookForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Logo } from "@/components/ui/logo"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Phone, Eye, EyeOff } from "lucide-react"
import { usePathname } from 'next/navigation'
import { getCurrentLocaleFromPath } from '@/lib/language-utils'
import { useState } from "react"
import { getErrorMessage, getErrorTitle } from '@/lib/error-utils'

export default function LoginPage() {
  const pathname = usePathname()
  const currentLocale = getCurrentLocaleFromPath(pathname)
  const { login, isAuthenticating } = useAuth({ redirectOnFail: false })
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useReactHookForm({
    defaultValues: {
      phone: "",
      password: "",
    },
  })
  
  const onSubmit = (values: { phone: string; password: string }) => {
    // Format phone number (remove spaces, dashes, etc.)
    const formattedPhone = values.phone.replace(/[\s\-\(\)]/g, '')
    
    login({ phone: formattedPhone, password: values.password }, {
      onSuccess: () => {
      },
      onError: (error) => {
        const errorTitle = getErrorTitle(error, tErrors)
        const errorMessage = getErrorMessage(error, tErrors)
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        })
      },
    })
  }
  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left branding panel */}
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
              <h1 className="text-6xl font-bold text-[#4082ea]">ELDA SYSTEM</h1>
            </div>
          </div>
  
          {/* Right form panel */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-white via-[#f6ffe8] to-[#e8f7d4] shadow-md rounded-2xl border-0 transition-transform duration-300 hover:scale-[1.02] animate-fade-in">
              <CardHeader className="text-center lg:hidden">
                <div className="inline-flex items-center justify-center mb-4">
                  <Logo
                    src="/elda-logo.png"
                    alt="ELDA Logo"
                    width={80}
                    height={80}
                    className="drop-shadow-xl"
                    fallbackText="ELDA"
                  />
                </div>
                <CardTitle className="text-2xl text-[#4082ea] font-extrabold tracking-tight">ELDA SYSTEM</CardTitle>
                <div className="mt-2 text-gray-500 text-sm font-medium">Admin/Company Login</div>
              </CardHeader>
              <div className="border-b border-gray-200 mx-6 mb-4" />
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      rules={{
                        required: tValidation('required'),
                        pattern: {
                          value: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
                          message: tValidation('phoneInvalid'),
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {tCommon('phone')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder={t('enterPhone')}
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
                      rules={{ required: tValidation('required') }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tCommon('password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={tCommon('password')}
                                disabled={isAuthenticating}
                                {...field}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                disabled={isAuthenticating}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
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
                      {isAuthenticating ? tCommon('loading') : tCommon('login')}
                    </Button>
                  </form>
                </Form>
                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  {t('dontHaveAccount')}{" "}
                  <Link href={`/${currentLocale}/signup`} className="text-blue-500 hover:underline font-semibold">
                    {tCommon('signup')}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  