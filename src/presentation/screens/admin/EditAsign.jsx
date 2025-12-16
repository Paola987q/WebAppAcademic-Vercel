// src/presentation/screens/admin/EditarAsignatura.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import BookIcon from "@mui/icons-material/Book";

import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";

export default function EditAsign() {
  const { asignaturaId } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [asignaturas, setAsignaturas] = useState([]);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar todas las asignaturas para validar duplicados
        const asignSnap = await getDocs(collection(db, "Asignaturas"));
        const asignList = asignSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAsignaturas(asignList);

        // Cargar la asignatura actual
        const docSnap = await getDoc(doc(db, "Asignaturas", asignaturaId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || "");
        }
      } catch (err) {
        alert("Error cargando asignatura");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asignaturaId]);

  const handleActualizar = async () => {
    if (!nombre.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    // Validar duplicado
    const duplicado = asignaturas.some(
      (a) => a.nombre.toLowerCase() === nombre.toLowerCase() && a.id !== asignaturaId
    );
    if (duplicado) {
      alert("Ya existe una asignatura con ese nombre");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "Asignaturas", asignaturaId), { nombre });
      alert("Asignatura actualizada con éxito");
      navigate(-1);
    } catch (err) {
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isSmall ? 2 : 5,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          width: isSmall ? "100%" : "50%",
          p: isSmall ? 3 : 5,
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        {/* TÍTULO CENTRADO */}
        <Typography
          variant={isSmall ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Editar Asignatura
        </Typography>

        {/* FORMULARIO */}
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Nombre */}
          <TextField
            fullWidth
            label="Nombre de la asignatura"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            InputProps={{
              startAdornment: <BookIcon sx={{ color: "#1976d2", mr: 1 }} />,
            }}
          />

          {/* Botón */}
          <Box
            onClick={handleActualizar}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              textAlign: "center",
              py: 1.5,
              borderRadius: 2,
              cursor: "pointer",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1259a7" },
            }}
          >
            {saving ? "Guardando..." : "Actualizar Asignatura"}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
