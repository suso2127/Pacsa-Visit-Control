import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Credenciales directas (no importar de config que puede estar vacío)
const firebaseConfig = {
  apiKey: "AIzaSyD9hts2UquaNJb41J7ZMZPPyYW8w8ur-mM",
  authDomain: "studio-278396377-37df1.firebaseapp.com",
  projectId: "studio-278396377-37df1",
  storageBucket: "studio-278396377-37df1.firebasestorage.app",
  messagingSenderId: "148790437339",
  appId: "1:148790437339:web:3a64b405475c47aa0473fe",
};

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
