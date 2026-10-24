import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const DEFAULT_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
export const FULL_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

export const getActiveDriveScope = (): string => {
  try {
    const stored = localStorage.getItem('omniz_drive_scope');
    if (!stored || stored === 'https://www.googleapis.com/auth/drive.file') {
      localStorage.setItem('omniz_drive_scope', DEFAULT_DRIVE_SCOPE);
      return DEFAULT_DRIVE_SCOPE;
    }
    return stored;
  } catch {
    return DEFAULT_DRIVE_SCOPE;
  }
};

export const setActiveDriveScope = (scope: string): void => {
  try {
    localStorage.setItem('omniz_drive_scope', scope);
  } catch {}
};

export const SCOPES = [
  DEFAULT_DRIVE_SCOPE,
];

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
googleProvider.addScope(DEFAULT_DRIVE_SCOPE);

export const createDriveProvider = (scope: string = getActiveDriveScope()): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'consent select_account',
  });
  // Ensure both drive.readonly (for full Drive browse/download) and drive.file are requested
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  if (scope && scope !== 'https://www.googleapis.com/auth/drive.readonly' && scope !== 'https://www.googleapis.com/auth/drive.file') {
    provider.addScope(scope);
  }
  return provider;
};

export const driveProvider = createDriveProvider();

export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

let isSignInInProgress = false;
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

export const signInWithGoogle = async (): Promise<User | null> => {
  if (isSignInInProgress) {
    return null;
  }

  isSignInInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/drive/save-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
              'x-user-id': user.uid,
            },
            body: JSON.stringify({
              userId: user.uid,
              userEmail: user.email || '',
              accessToken: credential.accessToken,
              expiresIn: 3600,
              scope: DEFAULT_DRIVE_SCOPE,
            }),
          });
        } catch (syncErr) {
          console.warn('[Google Drive] Backend sync note:', syncErr);
        }
      }
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (error: any) {
    const isCancelledByUser = 
      error?.code === 'auth/popup-closed-by-user' || 
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/user-cancelled';

    if (isCancelledByUser) {
      return null;
    }

    if (error?.code === 'auth/popup-blocked') {
      console.warn('Sign-in popup was blocked by the browser. Please allow popups for this site.');
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups to sign in.');
    }

    console.warn('Sign-In notice:', error?.message || error);
    throw error;
  } finally {
    isSignInInProgress = false;
  }
};

export const connectGoogleDrive = async (customScope?: string): Promise<{ user: User | null; accessToken: string; email?: string } | null> => {
  const scope = customScope || getActiveDriveScope();
  const provider = createDriveProvider(scope);

  try {
    let accessToken: string | null = null;
    let user: User | null = null;
    let driveEmail: string | undefined = undefined;

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        accessToken = credential.accessToken;
      }
      user = result.user;
      driveEmail = user?.email || undefined;
    } catch (popupErr: any) {
      const isCancelled = 
        popupErr?.code === 'auth/popup-closed-by-user' || 
        popupErr?.code === 'auth/cancelled-popup-request' ||
        popupErr?.code === 'auth/user-cancelled';

      if (isCancelled) {
        return null;
      }

      // Recover credential if account collision or linking conflict happens
      const fallbackCred = GoogleAuthProvider.credentialFromError(popupErr);
      if (fallbackCred?.accessToken) {
        accessToken = fallbackCred.accessToken;
        user = auth.currentUser;
      } else {
        throw popupErr;
      }
    }

    if (!accessToken) {
      throw new Error('Google Drive access token was not returned. Please try again.');
    }

    cachedAccessToken = accessToken;

    // Fetch the actual email of the Google account that granted Drive permissions
    try {
      const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (infoRes.ok) {
        const info = await infoRes.json();
        if (info.email) {
          driveEmail = info.email;
        }
      }
    } catch {
      // Ignore userinfo failure
    }

    const targetUserId = user?.uid || auth.currentUser?.uid || `user_${Date.now()}`;

    try {
      const idToken = await (user || auth.currentUser)?.getIdToken().catch(() => '');
      await fetch('/api/drive/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}),
          'x-user-id': targetUserId,
        },
        body: JSON.stringify({
          userId: targetUserId,
          userEmail: driveEmail || user?.email || '',
          accessToken,
          expiresIn: 3600,
          scope,
        }),
      });
    } catch (syncErr) {
      console.warn('[Google Drive] Backend sync note:', syncErr);
    }

    if (user) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email || driveEmail || '',
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }

    return { user, accessToken, email: driveEmail };
  } catch (error: any) {
    const isCancelledByUser = 
      error?.code === 'auth/popup-closed-by-user' || 
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/user-cancelled';

    if (isCancelledByUser) {
      return null;
    }

    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Google sign-in popup was blocked by your browser. Please click the pop-up icon in your address bar to allow pop-ups for this site, then try again.');
    }

    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not yet authorized in Firebase Auth. Please check Firebase Console.');
    }

    console.warn('Google Drive connect error:', error?.message || error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline. Verify network connection.');
    }
  }
}

testFirestoreConnection();

export { onAuthStateChanged, type User };
