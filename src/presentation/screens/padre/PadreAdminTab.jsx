// src/presentation/screens/padre/PadreAdminTab.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
} from "@mui/material";

import { auth, db } from "../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useNavigate } from "react-router-dom";

// ICONOS
import BookIcon from "@mui/icons-material/Book";
import ClassIcon from "@mui/icons-material/Class";
import GradeIcon from "@mui/icons-material/Grade";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function PadreAdminTab() {
  const [loading, setLoading] = useState(true);
  const [asignaturas, setAsignaturas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsignaturasDelEstudiante = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const estudianteSnap = await getDoc(doc(db, "Estudiantes", uid));
        if (!estudianteSnap.exists()) {
          setAsignaturas([]);
          return;
        }

        const { grado, paralelo } = estudianteSnap.data();
        if (!grado || !paralelo) {
          setAsignaturas([]);
          return;
        }

        const cursosQuery = query(
          collection(db, "Cursos"),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );

        const cursosSnap = await getDocs(cursosQuery);
        if (cursosSnap.empty) {
          setAsignaturas([]);
          return;
        }

        const asignaturasMap = new Map();
        for (const cursoDoc of cursosSnap.docs) {
          const cursoData = cursoDoc.data();
          const asignaturaId = cursoData.asignaturaId;
          if (!asignaturaId || asignaturasMap.has(asignaturaId)) continue;

          const asignaturaSnap = await getDoc(doc(db, "Asignaturas", asignaturaId));
          if (asignaturaSnap.exists()) {
            asignaturasMap.set(asignaturaId, {
              id: asignaturaSnap.id,
              nombre: asignaturaSnap.data().nombre,
              grado,
              paralelo,
            });
          }
        }

        setAsignaturas(Array.from(asignaturasMap.values()));
      } catch (error) {
        console.error("Error cargando asignaturas:", error);
        setAsignaturas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAsignaturasDelEstudiante();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando asignaturas...</Typography>
      </Box>
    );

  if (asignaturas.length === 0)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography>No se encontraron asignaturas para este estudiante.</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
      >
        Asignaturas del Estudiante
      </Typography>

      <Grid container spacing={3}>
        {asignaturas.map((asig) => (
          // NUEVO: no usamos item ni xs/sm/md
          <Grid key={asig.id} sx={{ flex: "1 0 100%", maxWidth: 400 }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BookIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                  {asig.nombre}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 14, opacity: 0.7 }}>
                {asig.grado} - Paralelo {asig.paralelo}
              </Typography>
              
              <Button
              variant="contained"
              startIcon={<ClassIcon />}
              onClick={() =>
                navigate("/padre/asistencia", {
                  state: { asignaturaId: asig.id, nombre: asig.nombre },
                })
                }
              >
                Asistencia
              </Button>


              <Button
                variant="contained"
                color="success"
                startIcon={<GradeIcon />}
                onClick={() =>
                  navigate("/padre/calificaciones", {
                    state: { asignaturaId: asig.id, nombre: asig.nombre },
                  })
                }
              >
                Calificaciones
              </Button>

              <Button
                variant="contained"
                color="warning"
                startIcon={<AssignmentIcon />}
                onClick={() =>
                  navigate("/padre/tareas", {
                    state: { asignaturaId: asig.id, nombre: asig.nombre },
                  })
                }
              >
                Tareas
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
