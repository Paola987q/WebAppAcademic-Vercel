// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUh4mujHKfjVnmp7zoWVZC6Tz-4kjZfVI",
  authDomain: "myschoolsystem-1e369.firebaseapp.com",
  projectId: "myschoolsystem-1e369",
  storageBucket: "myschoolsystem-1e369.firebasestorage.app",
  messagingSenderId: "186890639159",
  appId: "1:186890639159:web:33b061882b22ecc426ecb2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };