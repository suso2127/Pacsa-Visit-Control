
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa Firebase solo si no ha sido inicializado previamente.
 * Se han añadido protecciones para evitar el error 'Cannot read properties of undefined (reading 'trimEnd')'
 * que ocurre cuando la configuración de entrada es malformada o nula.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  // Verificar que la configuración mínima necesaria para el SDK esté presente
  const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "demo-key";
  
  if (!isConfigValid) {
    console.error("❌ ERROR CRÍTICO: Las credenciales de Firebase son inválidas. El sistema no podrá autenticar usuarios.");
  }

  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
