# ELDA Frontend - Admin Panel

A modern, multilingual document and ticket management system built with Next.js 15, featuring comprehensive admin capabilities for managing users, employees, requests, tickets, and documents.

## 🌟 Features

### Core Functionality
- **Dashboard**: Real-time statistics and overview of system activities
- **Request Management**: Handle company verification and tender requests
- **Ticket Management**: Support ticket system with status tracking
- **Document Management**: Upload, organize, and manage documents in threads
- **User Management**: Admin interface for user account management
- **Employee Management**: Comprehensive employee directory and management

### Technical Features
- **Multilingual Support**: English and Amharic localization with `next-intl`
- **Role-Based Access Control**: Admin, Lawyer, and User roles with different permissions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data synchronization with React Query
- **File Upload**: Drag-and-drop file upload with preview capabilities
- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Dark/Light Theme**: Theme switching with `next-themes`

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling and validation
- **TanStack Query** - Data fetching and caching
- **TanStack Table** - Advanced data tables
- **Lucide React** - Icon library

### Internationalization
- **next-intl** - Internationalization for Next.js
- **Supported Languages**: English (en), Amharic (am)

### Authentication & Security
- **NextAuth.js** - Authentication framework
- **JWT Tokens** - Secure token-based authentication
- **Role-based Access Control** - Granular permission system

## 📁 Project Structure

```
ELDA-Frontend/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── documents/           # Document management
│   │   ├── employees/           # Employee management
│   │   ├── login/              # Authentication
│   │   ├── requests/           # Request management
│   │   ├── tickets/            # Ticket management
│   │   └── users/              # User management
│   ├── globals.css              # Global styles
│   └── layout.tsx              # Root layout
├── components/                  # Reusable components
│   ├── cards/                  # Card components
│   ├── data-table/             # Table components
│   ├── documents/              # Document-specific components
│   ├── layout/                 # Layout components
│   ├── modals/                 # Modal dialogs
│   ├── requests/               # Request-specific components
│   └── ui/                     # Base UI components
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities and configurations
│   ├── api/                    # API client functions
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Helper utilities
├── messages/                   # Translation files
│   ├── en.json                # English translations
│   └── am.json                # Amharic translations
└── public/                    # Static assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 18.18 < 23
- npm >= 10

### Environment Variables
Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://elda-backend.onrender.com/api/v1
NEXT_PUBLIC_API_HOST=https://elda-backend.onrender.com
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication Endpoints
NEXT_PUBLIC_AUTH_REFRESH_ENDPOINT=/auth/refresh
NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT=/auth/login
NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT=/auth/logout

# Document Endpoints
NEXT_PUBLIC_DOCUMENTS_ENDPOINT=/doc-threads
NEXT_PUBLIC_DOCUMENTS_UPLOAD_ENDPOINT=/doc-threads/{threadId}/documents
NEXT_PUBLIC_DOCUMENTS_DOWNLOAD_ENDPOINT=/doc-threads/{threadId}/documents/{documentId}/download

# User & Employee Endpoints
NEXT_PUBLIC_USERS_ENDPOINT=/users
NEXT_PUBLIC_EMPLOYEES_ENDPOINT=/employees

# Security Configuration
NEXT_PUBLIC_COOKIE_SECURE=true
NEXT_PUBLIC_COOKIE_SAME_SITE=strict
NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY_DAYS=1
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY_DAYS=7

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_MAX_FILES_PER_UPLOAD=5
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,webp,xls,xlsx,zip,rar,json,csv

# Pagination
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=50
NEXT_PUBLIC_MAX_PAGE_SIZE=100

# Cache Configuration
NEXT_PUBLIC_CACHE_STALE_TIME=300000
NEXT_PUBLIC_CACHE_GC_TIME=600000

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# App Configuration
NEXT_PUBLIC_APP_NAME=ELDA Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ELDA-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🌍 Internationalization

The application supports multiple languages with automatic locale detection:

- **English (en)**: Default language
- **Amharic (am)**: Ethiopian language support

### Adding New Languages

1. Create a new translation file in `messages/` directory
2. Update the `locales` array in `lib/i18n.ts`
3. Add the new locale to the middleware configuration

### Using Translations

```tsx
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('common')
  return <h1>{t('welcome')}</h1>
}
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management, employee management
- **Lawyer**: Request management, document access
- **User**: Basic ticket and document management

### Authentication Flow
1. Login with email/password
2. Receive JWT access and refresh tokens
3. Automatic token refresh on expiration
4. Role-based route protection via middleware

## 📊 Key Components

### Dashboard
- Real-time statistics
- Recent activities
- Quick action buttons
- Data visualization with charts

### Document Management
- Thread-based organization
- File upload with drag-and-drop
- Document preview and download
- Version control

### Ticket System
- Status tracking (Open, In Progress, Resolved, Closed)
- Priority levels (Low, Medium, High, Critical)
- Assignment to users
- Comment system

### Request Management
- Company verification requests
- Tender requests
- Status workflow (Pending, Approved, Rejected)
- Document attachment support

## 🔧 Configuration

The application uses a centralized configuration system in `lib/config.ts` that:
- Loads settings from environment variables
- Provides fallback values
- Ensures type safety
- Supports different environments (development, production)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
Ensure all production environment variables are properly configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**ELDA Frontend** - Professional document and ticket management system