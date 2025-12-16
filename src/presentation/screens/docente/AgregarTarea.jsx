// src/presentation/screens/docente/AgregarTarea.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Paper,
} from "@mui/material";

import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function AgregarTarea() {
  const navigate = useNavigate();
  const location = useLocation();

  const { asignaturaId, nombre: asignaturaNombreFromState, grado, paralelo, cursos = [], regresarATab = 1 } = location.state || {};

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Protección: redirigir si faltan datos
  useEffect(() => {
    if (!asignaturaId || !grado || !paralelo) {
      navigate("/docente/dashboard", { replace: true });
    }
  }, [asignaturaId, grado, paralelo, navigate]);

  // Seleccionar automáticamente el curso correspondiente
  useEffect(() => {
    if (grado && paralelo) {
      const cursoEncontrado = cursos.find(
        (curso) => curso.grado === grado && curso.paralelo === paralelo
      );
      if (cursoEncontrado) {
        setCursoSeleccionado(cursoEncontrado.id);
      }
    }
  }, [grado, paralelo, cursos]);

  const handleCrearTarea = async () => {
    if (!cursoSeleccionado || !titulo || !descripcion || !fechaEntrega) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Obtener nombre de la asignatura (desde state o Firebase)
      let nombreAsignaturaAGuardar = asignaturaNombreFromState;
      if (!nombreAsignaturaAGuardar) {
        const snap = await getDoc(doc(db, "Asignaturas", asignaturaId));
        nombreAsignaturaAGuardar = snap.exists() ? snap.data().nombre : "Sin nombre";
      }

      // 1️⃣ Crear tarea en la subcolección del curso
      const tareasRef = collection(db, "Cursos", cursoSeleccionado, "Tareas");
      const tareaDocRef = await addDoc(tareasRef, {
        titulo,
        descripcion,
        fechaEntrega,
        creadaPor: auth.currentUser.uid,
        estadoGeneral: "Activa",
        asignaturaId,
        asignaturaNombre: nombreAsignaturaAGuardar,
        paralelo,  // 🔹 Guardamos el paralelo seleccionado
        grado,     // 🔹 Guardamos el grado (opcional, útil para notificación)
        createdAt: new Date(),
      });

      // 2️⃣ Obtener estudiantes del curso que coinciden con el paralelo
      const estudiantesQuery = query(
        collection(db, "Estudiantes"),
        where("cursoId", "==", cursoSeleccionado),
        where("paralelo", "==", paralelo) // 🔹 Filtramos por paralelo
      );
      const estudiantesSnap = await getDocs(estudiantesQuery);

      // 3️⃣ Crear estado por estudiante en subcolección Tareas/Estados
      const estadosPromises = estudiantesSnap.docs.map((estDoc) => {
        const estadoRef = doc(
          db,
          "Cursos",
          cursoSeleccionado,
          "Tareas",
          tareaDocRef.id,
          "Estados",
          estDoc.id
        );

        return setDoc(estadoRef, {
          cumplio: null,
          nota: "",
          estudianteNombre: estDoc.data().nombre,
        });
      });

      await Promise.all(estadosPromises);

      alert("Tarea creada correctamente");

      navigate("/docente/tareas-seleccion", {
        state: {
          asignaturaId,
          grado,
          paralelo,
          regresarATab,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Error creando tarea:", error);
      alert("No se pudo crear la tarea");
    } finally {
      setLoading(false);
    }
  };

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
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          mb={3}
        >
          Agregar Nueva Tarea
        </Typography>

        {/* Curso */}
        <TextField
          select
          fullWidth
          label="Curso y paralelo"
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Seleccionar curso</MenuItem>
          {cursos.map((curso) => (
            <MenuItem key={curso.id} value={curso.id}>
              {curso.grado} {curso.paralelo}
            </MenuItem>
          ))}
        </TextField>

        {/* Título */}
        <TextField
          fullWidth
          label="Título"
          placeholder="Ej: Ensayo sobre el medio ambiente"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Descripción */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Fecha de entrega */}
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
          disabled={loading}
          onClick={handleCrearTarea}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Crear Tarea"}
        </Button>
      </Paper>
    </Box>
  );
}
