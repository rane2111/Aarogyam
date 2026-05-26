# Aarogyam Health Hub 96

A comprehensive digital health platform that connects patients with healthcare services, provides symptom checking, medicine search, pharmacy inventory management, and telemedicine consultations.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Architecture](#architecture)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure login/signup with JWT-based authentication
- **Dashboard**: Personalized health dashboard for patients and doctors
- **Symptom Checker**: AI-powered symptom analysis tool
- **Doctor Consultation**: Book consultations with healthcare professionals
- **Video Calls**: Real-time telemedicine using Agora SDK
- **Medicine Search**: Comprehensive medicine database and search functionality
- **Pharmacy Inventory**: Manage and track pharmaceutical inventory
- **Doctor Requests**: Healthcare providers can request patient information
- **Responsive UI**: Mobile-friendly interface with dark/light mode support

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript 5.8
- **Bundler**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn/ui with Radix UI
- **State Management**: React Query (TanStack)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM 6.30
- **Charts**: Recharts 2.15
- **Video Call**: Agora RTC SDK 4.24
- **Notifications**: Sonner toast library
- **Testing**: Vitest + Playwright

### Backend
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Real-time subscriptions
- **Authentication**: Supabase Auth

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Package Manager**: Bun / npm
- **Testing**: Vitest + React Testing Library + Playwright

## 📁 Project Structure

```
aarogyam-health-hub-96/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── AuthPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── BookConsultation.tsx
│   │   ├── DoctorRequest.tsx
│   │   ├── MedicineSearch.tsx
│   │   ├── PharmacyInventory.tsx
│   │   ├── symptomchecker.tsx
│   │   └── videocall.tsx
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React Context for state
│   ├── lib/                # Utility functions
│   ├── integrations/       # External API integrations
│   ├── i18n/               # Internationalization
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   └── model/              # Supabase database models/migrations
├── supabase/               # Supabase configuration
├── public/                 # Static assets
├── tests/                  # Test files
├── playwright-config.ts    # E2E test configuration
├── vitest.config.ts        # Unit test configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── index.html              # HTML entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm/yarn/bun package manager
- Supabase account and project
- Agora account for video calling (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aarogyam-health-hub-96
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or with bun
   bun install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_AGORA_APP_ID=your_agora_app_id
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |
| `npm test` | Run unit tests once with Vitest |
| `npm run test:watch` | Run tests in watch mode |

## 🔧 Environment Setup

### Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and Anon Key from Settings → API
3. Run database migrations from the `backend/` directory
4. Add the credentials to your `.env` file

### Agora Video Calling (Optional)

1. Sign up at [agora.io](https://agora.io)
2. Create an app and get your App ID
3. Add to `.env` file:
   ```
   VITE_AGORA_APP_ID=your_app_id
   ```

## 💻 Development

### Code Structure Guidelines

- **Components**: Reusable UI components go in `src/components/`
- **Pages**: Full page components go in `src/pages/`
- **Hooks**: Custom hooks go in `src/hooks/`
- **Contexts**: State management with Context API in `src/contexts/`
- **Utils**: Helper functions in `src/lib/`

### Component Example

```tsx
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <div>
      <Button onClick={() => console.log('clicked')}>Click me</Button>
    </div>
  );
}
```

### Form Validation

The project uses Zod for schema validation with React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm test                  # Run all tests
npm run test:watch      # Watch mode
```

### E2E Tests (Playwright)

```bash
npx playwright test     # Run all tests
npx playwright test --headed  # Run with browser visible
```

Test files:
- `test-api.js` - API integration tests
- `test-schema.js` - Database schema tests
- `playwright-fixture.ts` - Test fixtures and setup

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

This generates optimized bundles in the `dist/` directory.

### Preview Build Locally

```bash
npm run build
npm run preview
```

### Deployment

The project can be deployed to:
- Vercel (recommended for Vite projects)
- Netlify
- GitHub Pages
- Any static hosting service

**Vercel Deployment:**
```bash
npm install -g vercel
vercel
```

## 📐 Architecture

### Frontend Architecture

```
Client (React + TypeScript)
  ├── Pages (Route-based components)
  ├── Components (Reusable UI)
  ├── Contexts (Global state)
  ├── Hooks (Business logic)
  └── API Layer (Supabase client)
       └── Supabase (PostgreSQL + Auth)
```

### Key Integrations

1. **Supabase**: Database and authentication
   - User management
   - Real-time subscriptions
   - Row-level security

2. **Agora**: Video conferencing
   - P2P video calls
   - Screen sharing
   - Real-time communication

3. **Tauri**: Desktop application (optional)

## 🔐 Security Considerations

- Sensitive credentials are stored in `.env` and never committed
- Supabase Row-Level Security (RLS) is enforced
- API keys are kept in environment variables
- HTTPS is used for all production communications
- CORS policies are properly configured

## 🌍 Internationalization

The project supports multiple languages via the `src/i18n/` directory. Add new language files and import them in your components.

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m 'Add feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Run `npm run lint` before committing
- Write meaningful commit messages

## 📞 Support & Resources

- **Documentation**: Check individual component files for inline documentation
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Guide**: https://vitejs.dev/guide/

## 📄 License

This project is proprietary. All rights reserved.
