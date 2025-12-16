// src/presentation/padre/CalificacionesEst.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

export default function CalificacionesEst() {
  const navigate = useNavigate();
  const location = useLocation();

  const asignaturaSeleccionada = location.state?.nombre || "";

  const [nombreEstudiante, setNombreEstudiante] = useState("");
  const [nota, setNota] = useState(null);
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState("trimestre1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nombreTrimestreMap = {
    trimestre1: "1er Trimestre",
    trimestre2: "2do Trimestre",
    trimestre3: "3er Trimestre",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError("Usuario no autenticado");
          return;
        }

        // Obtener nombre del estudiante
        const estudianteSnap = await getDoc(doc(db, "Estudiantes", uid));
        if (!estudianteSnap.exists()) {
          setError("No se encontró el estudiante");
          return;
        }
        setNombreEstudiante(estudianteSnap.data()?.nombre || "");

        // Obtener nota del trimestre y asignatura
        const califDocId = `${trimestreSeleccionado}_${asignaturaSeleccionada}`;
        const califSnap = await getDoc(
          doc(db, "Estudiantes", uid, "Calificaciones", califDocId)
        );

        setNota(califSnap.exists() ? califSnap.data().nota : "Pendiente");
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la calificación");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trimestreSeleccionado, asignaturaSeleccionada]);

  if (loading)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
        <CircularProgress />
        <Typography mt={2}>Cargando calificación...</Typography>
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigate("/padre/dashboard", { state: { tab: 1 }, replace: true })}
      >
        ← Regresar
      </Button>

      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
        Calificación de {nombreEstudiante} - {asignaturaSeleccionada}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="trimestre-label">Trimestre</InputLabel>
          <Select
            labelId="trimestre-label"
            value={trimestreSeleccionado}
            label="Trimestre"
            onChange={(e) => setTrimestreSeleccionado(e.target.value)}
          >
            {Object.entries(nombreTrimestreMap).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: "#f0f4f8", textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold">
              {nombreTrimestreMap[trimestreSeleccionado]}
            </Typography>
            <Typography sx={{ mt: 2, fontSize: 24, fontWeight: "bold" }}>
              {nota !== null ? nota : "Pendiente"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
