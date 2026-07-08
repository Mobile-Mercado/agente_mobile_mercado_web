// lib/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

// App Check: da ao Firebase um sinal de confiança de que o pedido vem do site de verdade
// (nao de automacao), do mesmo jeito que os apps mobile fazem com Play Integrity/App Attest.
// So ativa se a site key estiver configurada (ver .env.example) - sem ela, nao muda nada.
if (typeof window !== "undefined") {
  const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (appCheckSiteKey) {
    if (process.env.NODE_ENV !== "production") {
      // Necessario em localhost/dev: gera um token de depuracao no console do navegador
      // que precisa ser cadastrado em Firebase Console > App Check > Gerenciar tokens de depuracao.
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.error("[AppCheck] Falha ao inicializar:", err);
    }
  }
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
auth.languageCode = "pt-BR";
export const storage: FirebaseStorage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

export default app;
