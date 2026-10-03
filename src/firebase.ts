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

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Concurrency guard to prevent duplicate concurrent popup requests
let isSignInInProgress = false;

// Google Sign-In via Popup
export const signInWithGoogle = async (): Promise<User | null> => {
  // Prevent duplicate concurrent requests that trigger auth/cancelled-popup-request
  if (isSignInInProgress) {
    return null;
  }

  isSignInInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save user profile to Firestore
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Google User',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (error: any) {
    // Normal user actions (closing popup, clicking away, or duplicate click debounce) are not errors
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

    console.warn('Google Sign-In notice:', error?.message || error);
    throw error;
  } finally {
    isSignInInProgress = false;
  }
};

// Sign Out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

// Connection test as required by Firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline. Verify network connection.');
    }
  }
}

// Run connection check
testFirestoreConnection();

export { onAuthStateChanged, type User };
