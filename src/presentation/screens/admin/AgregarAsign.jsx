import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useNavigate, useNavigationType } from "react-router-dom";

export default function AgregarAsignatura() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  const navType = useNavigationType();

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔙 Regreso inteligente
  const handleBack = () => {
    if (navType === "PUSH") {
      navigate(-1); // vuelve a la pantalla anterior
    } else {
      navigate("/admin/dashboard"); // ruta de fallback
    }
  };

  // 🧪 Validar duplicados
  const verificarDuplicado = async (nombreAsignatura) => {
    const asignaturasRef = collection(db, "Asignaturas");
    const q = query(asignaturasRef, where("nombre", "==", nombreAsignatura));

    const snapshot = await getDocs(q);

    return !snapshot.empty; // true si ya existe
  };

  const handleAgregar = async () => {
    if (!nombre.trim()) {
      alert("Por favor ingresa el nombre de la asignatura");
      return;
    }

    setLoading(true);

    try {
      // 🚫 Verificar duplicado
      const existe = await verificarDuplicado(nombre.trim());

      if (existe) {
        alert("Ya existe una asignatura con este nombre");
        setLoading(false);
        return;
      }

      const asignaturasRef = collection(db, "Asignaturas");

      await addDoc(asignaturasRef, {
        nombre: nombre.trim(),
        fechaCreacion: new Date(),
      });

      alert("Asignatura agregada correctamente");
      handleBack(); // regreso inteligente
    } catch (error) {
      alert("Error al agregar la asignatura");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: isSmall ? "100%" : "1100px",
          padding: 4,
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          color="#333"
        >
          Agregar Asignatura
        </Typography>

        {/* Input con icono */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            paddingX: 2,
            paddingY: 1,
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
            marginBottom: 3,
          }}
        >
          <MenuBookIcon sx={{ color: "#007BFF", marginRight: 1 }} />
          <TextField
            fullWidth
            placeholder="Nombre de la asignatura"
            variant="standard"
            InputProps={{ disableUnderline: true }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Box>

        {/* Botón agregar */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleAgregar}
          disabled={loading}
          sx={{
            paddingY: 1.5,
            borderRadius: "12px",
            backgroundColor: "#007BFF",
            "&:hover": { backgroundColor: "#005fcc" },
            marginBottom: 2,
          }}
        >
          {loading ? (
            <CircularProgress size={26} sx={{ color: "#fff" }} />
          ) : (
            "Agregar Asignatura"
          )}
        </Button>

      </Paper>
    </Box>
  );
}
