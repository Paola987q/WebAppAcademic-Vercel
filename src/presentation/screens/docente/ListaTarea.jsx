// src/presentation/screens/docente/ListaTarea.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function ListaTarea() {
  const navigate = useNavigate();
  const location = useLocation();

  const { asignaturaId, grado, paralelo, regresarATab = 1 } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [cursoId, setCursoId] = useState(null);

  useEffect(() => {
    if (!asignaturaId || !grado || !paralelo) {
      alert("Información del curso incompleta");
      navigate("/docente/dashboard", { replace: true });
      return;
    }

    const fetchTareas = async () => {
      try {
        const uid = auth.currentUser.uid;

        // Buscar el curso exacto
        const cursoQuery = query(
          collection(db, "Cursos"),
          where("docenteId", "==", uid),
          where("asignaturaId", "==", asignaturaId),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );

        const cursoSnap = await getDocs(cursoQuery);
        if (cursoSnap.empty) {
          setTareas([]);
          setLoading(false);
          return;
        }

        const cursoDoc = cursoSnap.docs[0];
        setCursoId(cursoDoc.id);

        // Obtener tareas de ese curso
        const tareasSnap = await getDocs(collection(db, "Cursos", cursoDoc.id, "Tareas"));
        const listaTareas = tareasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setTareas(listaTareas);
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las tareas");
      } finally {
        setLoading(false);
      }
    };

    fetchTareas();
  }, [asignaturaId, grado, paralelo, navigate]);

  if (loading) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando tareas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
        Lista de Tareas - {grado} {paralelo}
      </Typography>

      {tareas.length === 0 ? (
        <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
          No existen tareas registradas.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {tareas.map((tarea) => (
            <Paper
              key={tarea.id}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{tarea.titulo}</Typography>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  Entrega: {tarea.fechaEntrega}
                </Typography>
              </Box>

              <IconButton
                color="primary"
                onClick={() =>
                  navigate("/docente/editar-tarea", {
                    state: {
                      cursoId,
                      tareaId: tarea.id,
                      asignaturaId,
                      grado,
                      paralelo,
                      regresarATab,
                    },
                  })
                }
              >
                <EditIcon />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
