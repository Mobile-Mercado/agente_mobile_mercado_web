import { existsSync, readFileSync } from "fs";
import path from "path";
import * as admin from "firebase-admin";

function initializeAdminApp(): admin.app.App | null {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_KEY?.replace(/\\n/g, "\n");

  try {
    if (projectId && clientEmail && privateKey) {
      return admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    }

    const localServiceAccountPath = path.join(process.cwd(), "appmobileprod-19505.json");
    if (existsSync(localServiceAccountPath)) {
      const serviceAccount = JSON.parse(readFileSync(localServiceAccountPath, "utf8"));
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    }

    return admin.initializeApp();
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin:", error);
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = initializeAdminApp();
  return app ? admin.firestore(app) : null;
}

export function getAdminAuth(): admin.auth.Auth | null {
  const app = initializeAdminApp();
  return app ? admin.auth(app) : null;
}

export { admin };
