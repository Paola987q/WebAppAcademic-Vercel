// src/presentation/screens/docente/EditarTarea.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EditarTarea() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cursoId,
    tareaId,
    regresarATab = 1,
    grado,
    paralelo,
    asignaturaId,
  } = location.state || {};

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔒 Cargar datos existentes de la tarea
  useEffect(() => {
    if (!cursoId || !tareaId) {
      navigate(-1);
      return;
    }

    const fetchTarea = async () => {
      try {
        const tareaRef = doc(db, "Cursos", cursoId, "Tareas", tareaId);
        const snap = await getDoc(tareaRef);

        if (!snap.exists()) {
          alert("No se encontró la tarea");
          navigate(-1);
          return;
        }

        const data = snap.data();
        setTitulo(data.titulo || "");
        setDescripcion(data.descripcion || "");
        setFechaEntrega(data.fechaEntrega || "");
      } catch (error) {
        console.error(error);
        alert("No se pudo cargar la tarea");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTarea();
  }, [cursoId, tareaId, navigate]);

  // 🔹 Guardar cambios sin perder estados de los estudiantes
  const handleGuardar = async () => {
    if (!titulo || !descripcion || !fechaEntrega) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setSaving(true);

      const tareaRef = doc(db, "Cursos", cursoId, "Tareas", tareaId);

      // Actualizar campos principales
      await updateDoc(tareaRef, {
        titulo,
        descripcion,
        fechaEntrega,
      });

      // Obtener lista de estudiantes del curso
      const estudiantesSnap = await getDocs(collection(db, "Estudiantes"));
      const estudiantesCurso = estudiantesSnap.docs.filter(
        (docEst) => docEst.data().cursoId === cursoId
      );

      // Asegurarse de que todos los estudiantes tengan su estado
      const estadosPromises = estudiantesCurso.map((estDoc) => {
        const estadoRef = doc(
          db,
          "Cursos",
          cursoId,
          "Tareas",
          tareaId,
          "Estados",
          estDoc.id
        );

        return setDoc(
          estadoRef,
          {
            estudianteNombre: estDoc.data().nombre,
            // si ya existía `cumplio` o `nota`, no se sobreescribe
          },
          { merge: true } // merge:true asegura no borrar los datos existentes
        );
      });

      await Promise.all(estadosPromises);

      alert("Tarea actualizada correctamente");

      navigate("/docente/tareas-seleccion", {
        state: { cursoId, asignaturaId, grado, paralelo, regresarATab },
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar la tarea");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando tarea...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 500,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          Editar Tarea
        </Typography>

        <TextField
          fullWidth
          label="Título"
          placeholder="Ej: Ensayo sobre el medio ambiente"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="date"
          label="Fecha de entrega"
          InputLabelProps={{ shrink: true }}
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={saving}
          onClick={handleGuardar}
        >
          {saving ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Guardar Cambios"}
        </Button>
      </Paper>
    </Box>
  );
}
