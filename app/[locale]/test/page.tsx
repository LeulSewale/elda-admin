import { getTranslations } from 'next-intl/server'

export default async function TestPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('common')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('loading')}
        </h1>
        <p className="text-gray-600">
          Localization Test Page - Locale: {locale}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Common translations:</p>
          <p>Login: {t('login')}</p>
          <p>Logout: {t('logout')}</p>
          <p>Save: {t('save')}</p>
        </div>
      </div>
    </div>
  )
}
