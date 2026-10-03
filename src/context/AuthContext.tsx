import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOutUser, onAuthStateChanged } from '../firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name?: string, email?: string) => void;
  logout: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAsGuest: () => {},
  logout: async () => {},
  authError: null,
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isGuest: false,
        });
      } else {
        // Check for local guest session if Firebase is not authenticated
        try {
          const storedGuest = localStorage.getItem('omniz_guest_user');
          if (storedGuest) {
            setUser(JSON.parse(storedGuest));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      const res = await signInWithGoogle();
      if (res) {
        try {
          localStorage.removeItem('omniz_guest_user');
        } catch {}
      }
    } catch (error: any) {
      const code = error?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled'
      ) {
        return;
      }
      if (code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
        return;
      }
      setAuthError(error?.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const loginAsGuest = (name = 'Guest User', email = 'guest@omniz.local') => {
    const guestUser: AppUser = {
      uid: `guest_${Date.now()}`,
      displayName: name,
      email,
      photoURL: null,
      isGuest: true,
    };
    setUser(guestUser);
    setAuthError(null);
    try {
      localStorage.setItem('omniz_guest_user', JSON.stringify(guestUser));
    } catch {}
  };

  const logout = async () => {
    try {
      setAuthError(null);
      try {
        localStorage.removeItem('omniz_guest_user');
      } catch {}
      setUser(null);
      await signOutUser();
    } catch (error: any) {
      console.warn('Logout notice:', error?.message || error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginAsGuest,
        logout,
        authError,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
