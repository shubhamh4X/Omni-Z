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

  const refreshDriveStatus = async () => {
    if (!user || user.isGuest) {
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setDriveEmail(null);
      return;
    }
    try {
      const st = await checkDriveStatus(user.uid);
      if (st.connected) {
        setIsDriveConnected(true);
        setDriveStatus('connected');
        setDriveEmail(st.email || user.email);
      } else {
        setIsDriveConnected(false);
        setDriveStatus('disconnected');
        setDriveEmail(null);
      }
    } catch {
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
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
          const st = await checkDriveStatus(currentUser.uid);
          if (st.connected) {
            setIsDriveConnected(true);
            setDriveStatus('connected');
            setDriveEmail(st.email || currentUser.email);
          } else {
            setIsDriveConnected(false);
            setDriveStatus('disconnected');
            setDriveEmail(null);
          }
        } catch {
          setIsDriveConnected(false);
          setDriveStatus('disconnected');
        }
      } else {
        setAccessToken(null);
        setIsDriveConnected(false);
        setDriveStatus('disconnected');
        setDriveEmail(null);

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

    if (!currentOmniUser || currentOmniUser.isGuest) {
      try {
        const loggedInUser = await signInWithGoogle();
        if (!loggedInUser) return false;
        currentOmniUser = {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          isGuest: false,
        };
        setUser(currentOmniUser);
        await refreshDriveStatus();
        return true;
      } catch (err: any) {
        setAuthError(err?.message || 'Please sign in with Google to connect Drive.');
        return false;
      }
    }

    const popup = window.open('about:blank', 'omniZGoogleDrive', 'width=540,height=700,menubar=no,toolbar=no');
    if (!popup) {
      setAuthError('Google sign-in popup was blocked by your browser. Please allow popups for this site in your browser address bar.');
      setDriveStatus('error');
      return false;
    }

    setDriveStatus('authorizing');
    setAuthError(null);

    try {
      const authRes = await fetch(
        `/api/drive/auth-url?userId=${encodeURIComponent(currentOmniUser.uid)}&userEmail=${encodeURIComponent(currentOmniUser.email || '')}`,
        {
          headers: {
            'x-user-id': currentOmniUser.uid,
          },
        }
      );

      if (!authRes.ok) {
        popup.close();
        try {
          const fbRes = await connectGoogleDrive(undefined, currentOmniUser.email || undefined);
          if (fbRes?.accessToken) {
            setIsDriveConnected(true);
            setDriveStatus('connected');
            setDriveEmail(currentOmniUser.email);
            return true;
          }
        } catch (fbErr: any) {
          console.warn('[Drive Auth] Direct flow note:', fbErr);
          if (fbErr?.message?.includes('timed out') || fbErr?.message?.includes('blocked')) {
            setAuthError(fbErr.message);
            setDriveStatus('error');
            return false;
          }
        }
        setDriveStatus('disconnected');
        return false;
      }

      const { url } = await authRes.json();
      popup.location.href = url;

      return await new Promise<boolean>((resolve) => {
        let isSettled = false;

        const cleanup = () => {
          isSettled = true;
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosedInterval);
        };

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
            cleanup();
            setIsDriveConnected(true);
            setDriveStatus('connected');
            setDriveEmail(currentOmniUser.email);
            resolve(true);
          } else if (event.data?.type === 'GOOGLE_DRIVE_AUTH_ERROR') {
            cleanup();
            setDriveStatus('error');
            setAuthError(event.data.error || 'Google Drive authorization failed.');
            resolve(false);
          }
        };

        window.addEventListener('message', handleMessage);

        const checkClosedInterval = setInterval(async () => {
          if (popup.closed && !isSettled) {
            cleanup();
            try {
              const st = await checkDriveStatus(currentOmniUser.uid);
              if (st.connected) {
                setIsDriveConnected(true);
                setDriveStatus('connected');
                setDriveEmail(st.email || currentOmniUser.email);
                resolve(true);
                return;
              }
            } catch {}
            setDriveStatus('disconnected');
            resolve(false);
          }
        }, 500);

        setTimeout(() => {
          if (!isSettled) {
            cleanup();
            if (!popup.closed) {
              try { popup.close(); } catch {}
            }
            setDriveStatus('disconnected');
            resolve(false);
          }
        }, 60000);
      });
    } catch (err: any) {
      if (!popup.closed) {
        try { popup.close(); } catch {}
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
      await signOutUser();
    } catch (error: any) {
      console.warn('Logout notice:', error?.message || error);
      setUser(null);
      setAccessToken(null);
      setIsDriveConnected(false);
      setDriveStatus('disconnected');
      setDriveEmail(null);
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
