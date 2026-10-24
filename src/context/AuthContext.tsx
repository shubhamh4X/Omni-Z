import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged, 
  connectGoogleDrive,
  getCachedAccessToken,
  setCachedAccessToken
} from '../firebase';
import { checkDriveStatus, disconnectDriveSession } from '../services/googleDrive';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

export type DriveConnectionState = 'disconnected' | 'authorizing' | 'connected' | 'expired' | 'revoked' | 'error';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  accessToken: string | null;
  isDriveConnected: boolean;
  driveStatus: DriveConnectionState;
  driveEmail: string | null;
  isDriveMismatched: boolean;
  loginWithGoogle: () => Promise<void>;
  connectDrive: (customScope?: string) => Promise<boolean>;
  disconnectDrive: () => Promise<void>;
  refreshDriveStatus: () => Promise<void>;
  loginAsGuest: (name?: string, email?: string) => void;
  logout: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  isDriveConnected: false,
  driveStatus: 'disconnected',
  driveEmail: null,
  isDriveMismatched: false,
  loginWithGoogle: async () => {},
  connectDrive: async () => false,
  disconnectDrive: async () => {},
  refreshDriveStatus: async () => {},
  loginAsGuest: () => {},
  logout: async () => {},
  authError: null,
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedAccessToken());
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);
  const [driveStatus, setDriveStatus] = useState<DriveConnectionState>('disconnected');
  const [driveEmail, setDriveEmail] = useState<string | null>(null);
  const [isDriveMismatched, setIsDriveMismatched] = useState<boolean>(false);

  const refreshDriveStatus = async () => {
    if (!user || user.isGuest) {
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setDriveEmail(null);
      setIsDriveMismatched(false);
      return;
    }
    try {
      const st = await checkDriveStatus(user.uid, user.email || undefined);
      if (st.connected) {
        setIsDriveConnected(true);
        setDriveStatus('connected');
        setDriveEmail(st.email || user.email);
        setIsDriveMismatched(Boolean(st.isAccountMismatched));
      } else {
        setIsDriveConnected(false);
        setDriveStatus('disconnected');
        setDriveEmail(null);
        setIsDriveMismatched(false);
      }
    } catch {
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setIsDriveMismatched(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const appUser: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isGuest: false,
        };
        setUser(appUser);
        setAccessToken(getCachedAccessToken());

        try {
          const st = await checkDriveStatus(currentUser.uid, currentUser.email || undefined);
          if (st.connected) {
            setIsDriveConnected(true);
            setDriveStatus('connected');
            setDriveEmail(st.email || currentUser.email);
            setIsDriveMismatched(Boolean(st.isAccountMismatched));
          } else {
            setIsDriveConnected(false);
            setDriveStatus('disconnected');
            setDriveEmail(null);
            setIsDriveMismatched(false);
          }
        } catch {
          setIsDriveConnected(false);
          setDriveStatus('disconnected');
          setIsDriveMismatched(false);
        }
      } else {
        setAccessToken(null);
        setIsDriveConnected(false);
        setDriveStatus('disconnected');
        setDriveEmail(null);
        setIsDriveMismatched(false);

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
        setAccessToken(getCachedAccessToken());
        try {
          localStorage.removeItem('omniz_guest_user');
        } catch {}
        await refreshDriveStatus();
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
      setAuthError(error?.message || 'Failed to sign in. Please try again.');
    }
  };

  const connectDrive = async (): Promise<boolean> => {
    let currentOmniUser = user;

    setDriveStatus('authorizing');
    setAuthError(null);

    try {
      const fbRes = await connectGoogleDrive();
      if (!fbRes || !fbRes.accessToken) {
        setDriveStatus('disconnected');
        return false;
      }

      const token = fbRes.accessToken;
      setAccessToken(token);
      setCachedAccessToken(token);
      setIsDriveConnected(true);
      setDriveStatus('connected');

      const authorizedEmail = fbRes.email || fbRes.user?.email || currentOmniUser?.email || null;
      setDriveEmail(authorizedEmail);

      if (fbRes.user) {
        const updatedUser: AppUser = {
          uid: fbRes.user.uid,
          email: fbRes.user.email,
          displayName: fbRes.user.displayName,
          photoURL: fbRes.user.photoURL,
          isGuest: false,
        };
        setUser(updatedUser);
      }
      setIsDriveMismatched(false);
      return true;
    } catch (err: any) {
      console.error('[Drive Auth Error]', err);
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled'
      ) {
        setDriveStatus('disconnected');
        return false;
      }
      if (code === 'auth/popup-blocked') {
        setAuthError('Google sign-in popup was blocked by your browser. Please allow popups for this site in your browser address bar.');
        setDriveStatus('error');
        return false;
      }
      setDriveStatus('error');
      setAuthError(err?.message || 'Failed to connect Google Drive.');
      return false;
    }
  };

  const disconnectDrive = async () => {
    if (user && !user.isGuest) {
      await disconnectDriveSession(user.uid);
    }
    setCachedAccessToken(null);
    setAccessToken(null);
    setIsDriveConnected(false);
    setDriveStatus('disconnected');
    setDriveEmail(null);
    setIsDriveMismatched(false);
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
    setAccessToken(null);
    setIsDriveConnected(false);
    setDriveStatus('disconnected');
    setDriveEmail(null);
    setIsDriveMismatched(false);
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
      setAccessToken(null);
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setDriveEmail(null);
      setIsDriveMismatched(false);
      await signOutUser();
    } catch (error: any) {
      console.warn('Logout notice:', error?.message || error);
      setUser(null);
      setAccessToken(null);
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setDriveEmail(null);
      setIsDriveMismatched(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        isDriveConnected,
        driveStatus,
        driveEmail,
        isDriveMismatched,
        loginWithGoogle,
        connectDrive,
        disconnectDrive,
        refreshDriveStatus,
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
