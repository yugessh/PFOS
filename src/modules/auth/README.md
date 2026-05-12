# PFOS Authentication Module

## Setup Instructions

1. **Configure Firebase**
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase config values to `.env.local`

2. **Wrap App with AuthProvider**
   ```tsx
   import { AuthProvider } from '@/modules/auth';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>
             {children}
           </AuthProvider>
         </body>
       </html>
     );
   }
   ```

3. **Use Protected Routes**
   ```tsx
   import { ProtectedRoute } from '@/modules/auth';
   
   export default function Dashboard() {
     return (
       <ProtectedRoute>
         <DashboardContent />
       </ProtectedRoute>
     );
   }
   ```

4. **Add Auth Pages**
   - `/auth/login` → LoginPage
   - `/auth/register` → RegisterPage

## Features

- Email/password authentication
- Google sign-in
- Form validation
- Error handling
- Loading states
- Responsive design
- Dark mode support
