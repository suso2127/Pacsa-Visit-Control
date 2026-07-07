
/**
 * @fileoverview Configuración de Firebase.
 * Esta configuración utiliza variables de entorno de Next.js.
 * Asegúrese de que las variables NEXT_PUBLIC_FIREBASE_* estén definidas en su archivo .env local.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Validación para evitar errores críticos en el cliente
if (typeof window !== 'undefined' && (!firebaseConfig.apiKey || firebaseConfig.apiKey === "demo-key")) {
  console.warn("⚠️ ADVERTENCIA: Firebase API Key no detectada o inválida ('demo-key'). Configure las variables NEXT_PUBLIC_FIREBASE_* en su archivo .env.");
}
