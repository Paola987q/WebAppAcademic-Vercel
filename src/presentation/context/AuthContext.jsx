import { createContext, useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // 🔒 evita updates tras logout

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      // 🔴 si no hay sesión → cortar TODO
      if (!firebaseUser) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // ⚠️ usa SIEMPRE los mismos nombres de colección
        const docenteRef = doc(db, "Docentes", firebaseUser.uid);
        const docenteSnap = await getDoc(docenteRef);

        if (!isMounted) return;

        if (docenteSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            role: "docente",
            ...docenteSnap.data(),
          });
        } else {
          const estudianteRef = doc(db, "Estudiantes", firebaseUser.uid);
          const estudianteSnap = await getDoc(estudianteRef);

          if (!isMounted) return;

          if (estudianteSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              role: "estudiante",
              ...estudianteSnap.data(),
            });
          } else {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (!isMounted) return;

            if (userSnap.exists()) {
              setUser({
                uid: firebaseUser.uid,
                role: "user",
                ...userSnap.data(),
              });
            } else {
              setUser(null);
            }
          }
        }
      } catch (error) {
        // ⚠️ permission-denied durante logout NO es error crítico
        if (error.code !== "permission-denied") {
          console.error("Error al obtener usuario:", error);
        }
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
