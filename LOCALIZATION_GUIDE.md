# 🌍 Localization Implementation Guide

## Overview
This project now supports **English** and **Amharic** localization using Next.js 15 with `next-intl`.

## 🚀 Features Implemented

### ✅ Core Localization Setup
- **next-intl** integration with Next.js 15
- **Locale-based routing** (`/en/...` and `/am/...`)
- **Automatic locale detection** and fallback
- **Server-side and client-side** translation support

### ✅ Language Support
- **English (en)**: Default language
- **Amharic (am)**: Ethiopian language with proper Unicode support

### ✅ Components Updated
- **Language Switcher**: Dropdown with flag icons
- **Sidebar Navigation**: All menu items translated
- **Dashboard**: Statistics, tables, and buttons
- **Login Page**: Form fields and validation messages
- **Authentication**: Error messages and success notifications

## 📁 File Structure

```
ELDA-Frontend/
├── lib/
│   └── i18n.ts                 # Internationalization configuration
├── messages/
│   ├── en.json                 # English translations
│   └── am.json                 # Amharic translations
├── components/
│   └── language-switcher.tsx   # Language selection component
├── app/
│   ├── layout.tsx              # Root layout with i18n provider
│   └── [locale]/               # Locale-based routing
│       ├── layout.tsx          # Locale-specific layout
│       ├── dashboard/          # Dashboard pages
│       ├── login/              # Login pages
│       └── ...                 # Other pages
└── middleware.ts               # Locale detection middleware
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Override default locale
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Optional: Enable debug logging
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true
```

### Supported Locales
```typescript
export const locales = ['en', 'am'] as const
export type Locale = (typeof locales)[number]
```

## 🎯 Usage Examples

### Using Translations in Components

```typescript
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  const tAuth = useTranslations('auth')
  
  return (
    <div>
      <h1>{tAuth('loginTitle')}</h1>
      <button>{t('login')}</button>
    </div>
  )
}
```

### Language Switcher
```typescript
import { LanguageSwitcher } from '@/components/language-switcher'

export function Header() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  )
}
```

## 📝 Translation Keys Structure

### Common Translations (`common`)
- `loading`, `error`, `success`
- `cancel`, `save`, `delete`, `edit`
- `search`, `filter`, `refresh`
- `login`, `logout`, `signup`

### Navigation (`navigation`)
- `dashboard`, `requestManagement`
- `ticketManagement`, `documentManagement`
- `userManagement`, `employeeManagement`

### Authentication (`auth`)
- `loginTitle`, `loginSubtitle`
- `loginSuccess`, `loginError`
- `sessionExpired`, `invalidCredentials`

### Dashboard (`dashboard`)
- `title`, `totalRequests`
- `pendingRequests`, `inProgressRequests`
- `completedRequests`, `recentRequests`

### Requests (`requests`)
- `title`, `createRequest`
- `serviceType`, `disabilityType`
- `pending`, `inProgress`, `completed`

## 🌐 URL Structure

### English (Default)
- `/` → Redirects to `/en`
- `/en/dashboard` → Dashboard in English
- `/en/login` → Login page in English

### Amharic
- `/am/dashboard` → Dashboard in Amharic
- `/am/login` → Login page in Amharic

## 🔄 Language Switching

The language switcher automatically:
1. **Detects current locale** from URL
2. **Preserves current page** when switching languages
3. **Updates URL** to new locale
4. **Maintains authentication state**

## 🎨 UI Considerations

### Amharic Text Support
- **Font**: Uses system fonts that support Amharic Unicode
- **Direction**: Left-to-right (LTR) text direction
- **Spacing**: Proper character spacing for Amharic text
- **Icons**: Flag emojis for visual language identification

### Responsive Design
- **Mobile**: Language switcher shows flag only
- **Desktop**: Shows flag + language name
- **Collapsed sidebar**: Tooltip shows full language name

## 🚀 Getting Started

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Localized Pages
- **English**: `http://localhost:3000/en/dashboard`
- **Amharic**: `http://localhost:3000/am/dashboard`

### 3. Test Language Switching
- Click the language switcher in the sidebar
- Verify URL changes and content updates
- Check that authentication state is preserved

## 🔧 Adding New Translations

### 1. Add to Message Files
```json
// messages/en.json
{
  "newSection": {
    "newKey": "English text"
  }
}

// messages/am.json
{
  "newSection": {
    "newKey": "አማርኛ ጽሑፍ"
  }
}
```

### 2. Use in Components
```typescript
const t = useTranslations('newSection')
return <div>{t('newKey')}</div>
```

## 🐛 Troubleshooting

### Common Issues

1. **Translation not showing**
   - Check if key exists in both language files
   - Verify the translation namespace is correct

2. **Language switcher not working**
   - Ensure middleware is properly configured
   - Check if locale is in the supported locales array

3. **Amharic text not displaying**
   - Verify browser supports Amharic Unicode
   - Check if font family includes Amharic characters

### Debug Mode
Enable debug logging to see locale detection:
```bash
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true npm run dev
```

## 📚 Resources

- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Amharic Unicode Support](https://unicode.org/charts/PDF/U1200.pdf)

---

**Status**: ✅ **Ready for Production**

The localization system is fully implemented and ready for use. All core components support both English and Amharic languages with proper routing and state management.
