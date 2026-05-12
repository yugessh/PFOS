// Pages
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';

// Components
export { 
  AuthCard, 
  AuthInput, 
  AuthButton, 
  AuthDivider, 
  GoogleSignInButton,
  ProtectedRoute 
} from './components';

// Hooks
export { AuthProvider, useAuth } from './hooks/useAuth';

// Types
export type { 
  User, 
  AuthCredentials, 
  AuthError, 
  AuthState, 
  AuthContextType 
} from './types';

// Services
export { authService } from './services/authService';
export { auth, googleProvider } from './services/firebase';
