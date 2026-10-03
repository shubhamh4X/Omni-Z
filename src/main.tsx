import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

// Clear legacy user-selected font overrides to ensure uniform Google Sans styling
try {
  localStorage.removeItem('omniz_font');
  document.documentElement.style.removeProperty('--font-family');
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
