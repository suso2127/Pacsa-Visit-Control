import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9hts2UquaNJb41J7ZMZPPyYW8w8ur-mM",
  authDomain: "studio-278396377-37df1.firebaseapp.com",
  projectId: "studio-278396377-37df1",
  storageBucket: "studio-278396377-37df1.firebasestorage.app",
  messagingSenderId: "148790437339",
  appId: "1:148790437339:web:3a64b405475c47aa0473fe",
};

let app;
let auth;
let db;

// Solo inicializar en el navegador, no durante el build del servidor
if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
