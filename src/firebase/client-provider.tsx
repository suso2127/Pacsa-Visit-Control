'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9hts2UquaNJb41J7ZMZPPyYW8w8ur-mM",
  authDomain: "studio-278396377-37df1.firebaseapp.com",
  projectId: "studio-278396377-37df1",
  storageBucket: "studio-278396377-37df1.firebasestorage.app",
  messagingSenderId: "148790437339",
  appId: "1:148790437339:web:3a64b405475c47aa0473fe",
};

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseApp, firestore, auth } = useMemo(() => {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return {
      firebaseApp: app,
      firestore: getFirestore(app),
      auth: getAuth(app),
    };
  }, []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
};
