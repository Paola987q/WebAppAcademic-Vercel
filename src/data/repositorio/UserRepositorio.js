//USER REPOSITORIO
import { auth, db } from '../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../../domain/models/User';

export class UserRepositorio {
  
  async registerUser({ name, cedula, email, password, role }) {
    // Crear usuario en auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar datos adicionales en Firestore
    const userDoc = {
      uid,
      name,
      cedula,
      email,
      role
    };

    await setDoc(doc(db, "users", uid), userDoc);

    return new User(userDoc);
  }

  async loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Obtener datos del usuario en Firestore
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return new User(docSnap.data());
    } else {
      throw new Error("No existe usuario en Firestore");
    }
  }
}
