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

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

let isSignInInProgress = false;

export const signInWithGoogle = async (): Promise<User | null> => {

  if (isSignInInProgress) {
    return null;
  }

  isSignInInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
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

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
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
