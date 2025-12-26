// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase 
const firebaseConfig = {
  apiKey: import.meta.env.VIT_FB_API_KEY,
  authDomain: import.meta.env.VIT_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VIT_FB_PROJECT_ID,
  storageBucket: import.meta.env.VIT_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VIT_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VIT_FB_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
