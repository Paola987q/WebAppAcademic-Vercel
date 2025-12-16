import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Button,
  TextField,
  Chip,
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function CalificarTarea() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    tareaId,
    asignaturaId,
    grado,
    paralelo,
    regresarATab = 1,
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estados, setEstados] = useState({});

  useEffect(() => {
    if (!tareaId || !asignaturaId || !grado || !paralelo) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const uid = auth.currentUser.uid;

        // 1️⃣ Obtener el curso exacto (IGUAL que asistencia)
        const cursoQuery = query(
          collection(db, "Cursos"),
          where("docenteId", "==", uid),
          where("asignaturaId", "==", asignaturaId),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );

        const cursoSnap = await getDocs(cursoQuery);

        if (cursoSnap.empty) {
          throw new Error("Curso no encontrado");
        }

        const cursoId = cursoSnap.docs[0].id;

        // 2️⃣ Obtener estudiantes del curso
        const estQuery = query(
          collection(db, "Estudiantes"),
          where("cursoId", "==", cursoId)
        );

        const estSnap = await getDocs(estQuery);

        const listaEstudiantes = estSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEstudiantes(listaEstudiantes);

        // 3️⃣ Obtener estados de la tarea
        const estadosTemp = {};

        for (const est of listaEstudiantes) {
          const estadoRef = doc(
            db,
            "Cursos",
            cursoId,
            "Tareas",
            tareaId,
            "Estados",
            est.id
          );

          const estadoSnap = await getDoc(estadoRef);

          estadosTemp[est.id] = estadoSnap.exists()
            ? estadoSnap.data()
            : { cumplio: false, nota: "" };
        }

        setEstados(estadosTemp);
      } catch (error) {
        console.error("Error cargando datos:", error);
        alert("No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tareaId, asignaturaId, grado, paralelo]);

  const toggleCumplio = (id) => {
    setEstados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        cumplio: !prev[id]?.cumplio,
      },
    }));
  };

  const changeNota = (id, value) => {
    setEstados((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        nota: value,
      },
    }));
  };

  const guardarEstados = async () => {
    try {
      const uid = auth.currentUser.uid;

      const cursoQuery = query(
        collection(db, "Cursos"),
        where("docenteId", "==", uid),
        where("asignaturaId", "==", asignaturaId),
        where("grado", "==", grado),
        where("paralelo", "==", paralelo)
      );

      const cursoSnap = await getDocs(cursoQuery);
      const cursoId = cursoSnap.docs[0].id;

      const promises = estudiantes.map((est) =>
        setDoc(
          doc(db, "Cursos", cursoId, "Tareas", tareaId, "Estados", est.id),
          {
            cumplio: estados[est.id]?.cumplio ?? false,
            nota: estados[est.id]?.nota?.trim() || "Pendiente",
          }
        )
      );

      await Promise.all(promises);

      alert("Calificaciones guardadas correctamente");

      navigate("/docente/dashboard", {
        state: { tab: regresarATab },
        replace: true,
      });
    } catch (error) {
      console.error(error);
      alert("Error al guardar calificaciones");
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Cargando estudiantes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 1 }}>
        Calificar Tarea
      </Typography>

      <Typography sx={{ textAlign: "center", mb: 3, color: "text.secondary" }}>
        {grado} {paralelo}
      </Typography>

      {estudiantes.length === 0 ? (
        <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
          No hay estudiantes registrados en este curso.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {estudiantes.map((est) => {
            const estado = estados[est.id] || {};
            return (
              <Paper
                key={est.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {est.nombre}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Cédula: {est.cedula}
                  </Typography>
                </Box>

                <Chip
                  label={estado.cumplio ? "Cumplió" : "No cumplió"}
                  color={estado.cumplio ? "success" : "error"}
                  onClick={() => toggleCumplio(est.id)}
                  sx={{ cursor: "pointer" }}
                />

                <TextField
                  label="Nota"
                  size="small"
                  value={estado.nota || ""}
                  onChange={(e) => changeNota(est.id, e.target.value)}
                  sx={{ width: 100 }}
                />
              </Paper>
            );
          })}
        </Stack>
      )}

      {estudiantes.length > 0 && (
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 4, py: 1.5 }}
          onClick={guardarEstados}
        >
          Guardar Calificaciones
        </Button>
      )}
    </Box>
  );
}
