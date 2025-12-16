// src/presentation/screens/admin/EditDocent.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Person, Badge, Email } from "@mui/icons-material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";

export default function EditDocent() {
  const { docenteId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const docRef = doc(db, "Docentes", docenteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || "");
          setCedula(data.cedula || "");
          setEmail(data.email || "");
        } else {
          alert("No se encontró el docente");
          navigate("/admin/listdocent");
        }
      } catch (error) {
        alert("No se pudo cargar el docente");
        console.error(error);
        navigate("/admin/listdocent");
      } finally {
        setLoading(false);
      }
    };

    fetchDocente();
  }, [docenteId, navigate]);

  const handleActualizar = async () => {
    if (!nombre || !cedula || !email) {
      alert("Por favor completa todos los campos");
      return;
    }

    setUpdating(true);
    try {
      const docRef = doc(db, "Docentes", docenteId);
      await updateDoc(docRef, { nombre, cedula, email });
      alert("Docente actualizado correctamente");
      navigate("/admin/listdocent");
    } catch (error) {
      alert("No se pudo actualizar el docente");
      console.error(error);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress color="primary" />
        <Typography mt={2}>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Grid container justifyContent="center" px={isMobile ? 2 : 4} py={4}>
      <Grid
        item
        xs={12}
        sx={{
          background: "#fff",
          p: isMobile ? 3 : 5,
          borderRadius: 4,
          boxShadow: 4,
          width: "100%",
          maxWidth: isMobile ? "100%" : 1200,
          margin: "0 auto",
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          gutterBottom
          fontWeight="bold"
        >
          Editar Docente
        </Typography>

        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <TextField
              label="Nombre completo"
              fullWidth
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: "#1976d2" }} />,
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Cédula"
              fullWidth
              variant="outlined"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: <Badge sx={{ mr: 1, color: "#1976d2" }} />,
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Correo electrónico"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: "#1976d2" }} />,
              }}
              size={isMobile ? "small" : "medium"}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleActualizar}
              disabled={updating}
              size={isMobile ? "medium" : "large"}
            >
              {updating ? "Actualizando..." : "Actualizar Docente"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
