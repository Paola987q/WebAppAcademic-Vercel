// src/presentation/screens/padre/AsistenciaEst.jsx
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
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

export default function AsistenciaEst() {
  const navigate = useNavigate();
  const location = useLocation();

  const asignaturaSeleccionada = location.state?.nombre || "";

  const [nombreEstudiante, setNombreEstudiante] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [asistenciasFiltradas, setAsistenciasFiltradas] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : `${new Date().getMonth() + 1}`
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(`${new Date().getFullYear()}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError("Usuario no autenticado");
          return;
        }

        const estudianteSnap = await getDoc(doc(db, "Estudiantes", uid));
        if (!estudianteSnap.exists()) {
          setError("No se encontró el estudiante");
          return;
        }

        setNombreEstudiante(estudianteSnap.data()?.nombre || "");

        const asistenciaQuery = query(
          collection(db, "Asistencias"),
          where("estudianteId", "==", uid)
        );

        const snapshot = await getDocs(asistenciaQuery);
        const lista = snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() }));
        lista.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
        setAsistencias(lista);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la asistencia");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtrados = asistencias.filter(a => {
      if (!a.fecha) return false;
      const [anioDoc = "", mesDoc = ""] = a.fecha.split("-");
      return (
        mesDoc === mesSeleccionado &&
        anioDoc === anioSeleccionado &&
        a.asignaturaNombre === asignaturaSeleccionada
      );
    });

    setAsistenciasFiltradas(filtrados);
  }, [asistencias, mesSeleccionado, anioSeleccionado, asignaturaSeleccionada]);

  const totalPresente = asistenciasFiltradas.filter(a => a.estado === "Presente").length;
  const totalAtraso = asistenciasFiltradas.filter(a => a.estado === "Atraso").length;
  const totalJustificada = asistenciasFiltradas.filter(a => a.estado === "Falta Justificada").length;
  const totalInjustificada = asistenciasFiltradas.filter(a => a.estado === "Falta Injustificada").length;

  const estadoColor = (estado) => {
    switch (estado) {
      case "Presente": return "success.main";
      case "Atraso": return "warning.main";
      case "Falta Justificada": return "info.main";
      case "Falta Injustificada": return "error.main";
      default: return "text.primary";
    }
  };

  if (loading) return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
      <CircularProgress />
      <Typography mt={2}>Cargando asistencia...</Typography>
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
        Asistencia de {nombreEstudiante} - {asignaturaSeleccionada}
      </Typography>

      <Grid container spacing={2} mb={4}>
        {/* Selección de Mes */}
        <Grid sx={{ flex: 1, minWidth: 150 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="mes-label">Mes</InputLabel>
            <Select
              labelId="mes-label"
              id="mes-select"
              name="mes"
              value={mesSeleccionado}
              onChange={e => setMesSeleccionado(e.target.value)}
              label="Mes"
              inputProps={{ id: "mes-select" }} // Esto asocia correctamente el label
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, "0");
                const nombreMes = new Date(0, i).toLocaleString("es-ES", { month: "long" });
                return <MenuItem key={val} value={val}>{nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Selección de Año */}
        <Grid sx={{ flex: 1, minWidth: 150 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="anio-label">Año</InputLabel>
            <Select
              labelId="anio-label"
              id="anio-select"
              name="anio"
              value={anioSeleccionado}
              onChange={e => setAnioSeleccionado(e.target.value)}
              label="Año"
              inputProps={{ id: "anio-select" }} // Esto asocia correctamente el label
            >
              {[2024, 2025, 2026].map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#fafafa" }}>
        <Typography variant="h6" fontWeight="bold" mb={1}>Resumen</Typography>
        <Typography>✅ Presentes: {totalPresente}</Typography>
        <Typography>⚠️ Atrasos: {totalAtraso}</Typography>
        <Typography>🟦 Faltas Justificadas: {totalJustificada}</Typography>
        <Typography>❌ Faltas Injustificadas: {totalInjustificada}</Typography>
      </Paper>

      {asistenciasFiltradas.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No hay registros para esta asignatura
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {asistenciasFiltradas.map(a => (
            <Grid key={a.id} sx={{ flex: "1 0 100%", maxWidth: 400 }}>
              <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "#f9f9f9" }}>
                <Typography>📅 {a.fecha}</Typography>
                <Typography color="text.secondary">🏫 {a.grado} {a.paralelo}</Typography>
                <Typography color="text.secondary">📘 {a.asignaturaNombre}</Typography>
                <Typography fontWeight="bold" mt={1} color={estadoColor(a.estado)}>
                  {a.estado}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
