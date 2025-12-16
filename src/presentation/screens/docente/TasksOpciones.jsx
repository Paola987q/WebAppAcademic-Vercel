import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function TaksOpciones() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    asignaturaId,
    nombre,
    grado,
    paralelo,
    regresarATab = 1,
  } = location.state || {};

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 Protección total: datos obligatorios
    if (!asignaturaId || !grado || !paralelo) {
      alert("Información incompleta del curso");
      navigate("/docente/dashboard", { replace: true });
      return;
    }

    const fetchCursos = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const cursosQuery = query(
          collection(db, "Cursos"),
          where("docenteId", "==", uid),
          where("asignaturaId", "==", asignaturaId),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );

        const snapshot = await getDocs(cursosQuery);

        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCursos(lista);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        alert("No se pudieron cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [asignaturaId, grado, paralelo, navigate]);

  // ⏳ Loader centrado
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando opciones...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, sm: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        {/* 🔙 Regreso inteligente */}
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
          onClick={() =>
            navigate("/docente/dashboard", {
              state: { tab: regresarATab },
              replace: true,
            })
          }
        >
          Regresar
        </Button>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            {nombre}
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {grado} — Paralelo {paralelo}
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate("/docente/crear-tarea", {
                  state: {
                    asignaturaId,
                    grado,
                    paralelo,
                    cursos,
                    regresarATab,
                  },
                })
              }
            >
              Agregar Tarea
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() =>
                navigate("/docente/lista-tarea", {
                  state: {
                    asignaturaId,
                    grado,
                    paralelo,
                    cursos,
                    regresarATab,
                  },
                })
              }
            >
              Calificar Tarea
            </Button>

            <Button
              variant="contained"
              color="warning"
              startIcon={<EditIcon />}
              onClick={() =>
                navigate("/docente/seleccionar-tarea", {
                  state: {
                    asignaturaId,
                    grado,
                    paralelo,
                    cursos,
                    regresarATab,
                  },
                })
              }
            >
              Editar Tarea
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
