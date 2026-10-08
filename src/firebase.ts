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

export const DEFAULT_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const FULL_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

export const getActiveDriveScope = (): string => {
  try {
    return localStorage.getItem('omniz_drive_scope') || DEFAULT_DRIVE_SCOPE;
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

export const createDriveProvider = (scope: string = getActiveDriveScope(), loginEmail?: string): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  const params: Record<string, string> = {
    prompt: 'consent',
  };
  if (loginEmail && loginEmail.includes('@')) {
    params.login_hint = loginEmail;
  }
  provider.setCustomParameters(params);
  provider.addScope(scope);
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

export const connectGoogleDrive = async (customScope?: string, userEmail?: string): Promise<{ user: User | null; accessToken: string } | null> => {
  const scope = customScope || getActiveDriveScope();
  const provider = createDriveProvider(scope, userEmail);

  let timerId: any = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error('TIMEOUT_POPUP_NOT_RESPONDING'));
    }, 25000);
  });

  try {
    const popupPromise = signInWithPopup(auth, provider);
    const result = await Promise.race([popupPromise, timeoutPromise]);
    if (timerId) clearTimeout(timerId);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token was not returned. Please try again.');
    }

    cachedAccessToken = credential.accessToken;
    const user = result.user;

    if (user) {
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
            userEmail: user.email || userEmail || '',
            accessToken: credential.accessToken,
            expiresIn: 3600,
            scope,
          }),
        });
      } catch (syncErr) {
        console.warn('[Google Drive] Backend sync note:', syncErr);
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
      ).catch(() => {});
    }

    return { user, accessToken: credential.accessToken };
  } catch (error: any) {
    if (timerId) clearTimeout(timerId);

    if (error?.message === 'TIMEOUT_POPUP_NOT_RESPONDING') {
      throw new Error('Google Drive sign-in timed out. Check if your browser blocked the Google sign-in window (look for a "Pop-up blocked" icon in your address bar).');
    }

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
