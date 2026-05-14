# Smart Money Tracker - Finance Management Application

A modern, scalable React + Vite finance management application with Tailwind CSS, React Router, and Firebase integration.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: Context API (extensible)
- **Backend**: Firebase (ready to integrate)
- **Icons**: Lucide React
- **Utils**: clsx

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, fonts, etc.)
├── components/
│   ├── common/          # Reusable components (Button, Card, Input, etc.)
│   ├── layout/          # Layout components (Layout, Sidebar, Navbar)
│   └── index.js         # Component exports
├── config/
│   └── firebase.js      # Firebase configuration (placeholder)
├── context/
│   └── ThemeContext.jsx # Dark mode theme context
├── hooks/
│   ├── useLocalStorage.js
│   └── index.js
├── modules/             # Feature modules
│   ├── dashboard/
│   ├── transactions/
│   └── accounts/
├── pages/
│   ├── HomePage.jsx
│   ├── NotFoundPage.jsx
│   └── index.js
├── router/
│   └── index.jsx        # React Router configuration
├── styles/
│   └── globals.css      # Global Tailwind styles
├── utils/
│   ├── formatters.js    # Currency, date formatters and utilities
│   └── index.js
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## ✨ Features

### Architecture
- ✅ Scalable modular structure
- ✅ React Router setup with lazy loading ready
- ✅ Context API for state management
- ✅ Reusable component system
- ✅ Firebase configuration placeholder
- ✅ Environment variables support

### UI Components
- ✅ Responsive sidebar navigation
- ✅ Top navbar with theme toggle
- ✅ Mobile-responsive design
- ✅ Dark mode support (configurable)
- ✅ Reusable Button, Card, Input components
- ✅ Clean, minimal design with Tailwind CSS

### Layout System
- ✅ Fixed sidebar (collapses on mobile)
- ✅ Fixed navbar with theme toggle
- ✅ Responsive main content area
- ✅ Mobile menu overlay

## 🎨 Theming

The application supports both light and dark modes. Theme preference is saved to localStorage and can be toggled via the navbar button.

Use the `useTheme()` hook in any component:

```jsx
import { useTheme } from './context/ThemeContext';

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Toggle Theme</button>;
};
```

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🔐 Firebase Setup

1. Create a `.env.local` file in the root directory
2. Add your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Uncomment the Firebase initialization code in `src/config/firebase.js`

## 📝 Module Structure

Each feature module should follow this structure:

```
src/modules/feature-name/
├── components/      # Feature-specific components
├── hooks/           # Feature-specific hooks
├── utils/           # Feature-specific utilities
├── context/         # Feature-specific context
├── services/        # API calls and business logic
└── index.js         # Module exports
```

## 🎯 Component Usage Examples

### Button Component
```jsx
import { Button } from '@/components';

<Button variant="primary" size="md">
  Click me
</Button>
```

### Card Component
```jsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components';

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>Content here</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input Component
```jsx
import { Input } from '@/components';

<Input
  label="Amount"
  type="number"
  placeholder="Enter amount"
  error={error && "This field is required"}
/>
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## 🛠️ Utilities

### Formatters
- `formatCurrency(amount, currency)` - Format numbers as currency
- `formatDate(date, format)` - Format dates
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function

### Hooks
- `useLocalStorage(key, initialValue)` - Sync state with localStorage
- `useTheme()` - Access theme context

## 📝 Adding New Features

1. Create a new module in `src/modules/`
2. Add routes in `src/router/index.jsx`
3. Create feature components in the module directory
4. Use shared components from `src/components/`
5. Implement feature-specific logic in hooks and utils

## 🔄 Environment Setup

The project is configured with:
- Tailwind CSS for styling
- PostCSS for CSS processing
- Autoprefixer for browser compatibility
- React Router for client-side routing

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Firebase Documentation](https://firebase.google.com/docs)

## 📄 License

This project is ready for development. Configure Firebase and start building!
