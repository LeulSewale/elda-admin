
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
  import Image from "next/image"
  import { useTranslations } from 'next-intl'
  import { LanguageSwitcher } from '@/components/language-switcher'
  
  export default function LoginPage() {
    const { login, isAuthenticating } = useAuth({ redirectOnFail: false })
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');
    const tValidation = useTranslations('validation');
    
    const form = useReactHookForm({
      defaultValues: {
        email: "",
        password: "",
      },
    })
    
    const onSubmit = (values: { email: string; password: string }) => {
      login(values, {
        onSuccess: () => {
        },
        onError: (error) => {
          let message = t('loginError')
          if (error?.response && typeof error.response.data === "object" && error.response.data !== null && "message" in error.response.data) {
            message = (error.response.data as { message?: string }).message || error?.message || message
          } else if (error?.message) {
            message = error.message
          }
          toast({
            title: t('loginError'),
            description: message,
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
                <Image
                  src="/elda-logo.png"
                  alt="ELDA Logo"
                  width={120}
                  height={120}
                  className="object-contain drop-shadow-xl"
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
                  <Image
                    src="/elda-logo.png"
                    alt="ELDA Logo"
                    width={80}
                    height={80}
                    className="object-contain drop-shadow-xl"
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
                      name="email"
                      rules={{
                        required: tValidation('required'),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: tValidation('emailInvalid'),
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tCommon('email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={tCommon('email')}
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
                            <Input
                              type="password"
                              placeholder={tCommon('password')}
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
                      {isAuthenticating ? tCommon('loading') : tCommon('login')}
                    </Button>
                  </form>
                </Form>
                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  {t('dontHaveAccount')}{" "}
                  <Link href="/signup" className="text-blue-500 hover:underline font-semibold">
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
  