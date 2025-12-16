// src/presentation/screens/docente/Calificaciones.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function Calificaciones() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nombre: asignaturaNombre, grado, paralelo, regresarATab } = location.state;

  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState({});
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState("trimestre1");

  const nombreTrimestreMap = {
    trimestre1: "1er Trimestre",
    trimestre2: "2do Trimestre",
    trimestre3: "3er Trimestre",
  };

  useEffect(() => {
    const fetchEstudiantesYNotas = async () => {
      setLoading(true);
      try {
        // Obtener estudiantes del grado y paralelo
        const q = query(
          collection(db, "Estudiantes"),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setEstudiantes([]);
          setNotas({});
          setLoading(false);
          return;
        }

        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEstudiantes(lista);

        // Cargar notas existentes de la asignatura y trimestre
        const notasIniciales = {};
        for (const est of lista) {
          const califDocId = `${trimestreSeleccionado}_${asignaturaNombre}`;
          const califDocRef = doc(db, "Estudiantes", est.id, "Calificaciones", califDocId);
          const califSnap = await getDoc(califDocRef);

          notasIniciales[est.id] = califSnap.exists() ? califSnap.data().nota?.toString() || "" : "";
        }

        setNotas(notasIniciales);
      } catch (error) {
        console.error("Error cargando calificaciones:", error);
      }
      setLoading(false);
    };

    fetchEstudiantesYNotas();
  }, [grado, paralelo, trimestreSeleccionado, asignaturaNombre]);

  const handleNotaChange = (id, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNotas(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleGuardar = async () => {
    try {
      for (const est of estudiantes) {
        const notaNum = parseFloat(notas[est.id]);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
          alert(`Nota inválida para ${est.nombre}`);
          return;
        }

        const califDocId = `${trimestreSeleccionado}_${asignaturaNombre}`;
        await setDoc(
          doc(db, "Estudiantes", est.id, "Calificaciones", califDocId),
          {
            nota: notaNum,
            fechaActualizacion: new Date(),
            asignaturaNombre,
            trimestre: trimestreSeleccionado,
          }
        );
      }

      alert("Calificaciones guardadas correctamente");
      navigate("/docente/dashboard", { state: { tab: regresarATab }, replace: true });
    } catch (error) {
      console.error(error);
      alert("Error al guardar calificaciones");
    }
  };

  const handleVerReporte = () => {
    navigate(
      `/docente/reportecalificacion?grado=${grado}&paralelo=${paralelo}&trimestre=${trimestreSeleccionado}&asignatura=${asignaturaNombre}`
    );
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando estudiantes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button
        onClick={() => navigate("/docente/dashboard", { state: { tab: regresarATab }, replace: true })}
        sx={{ mb: 3 }}
      >
        ← Regresar
      </Button>

      <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
        Calificaciones: {asignaturaNombre} - {grado} {paralelo}
      </Typography>

      {/* Selector de trimestre y botón ver reporte */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
        <TextField
          select
          label="Trimestre"
          value={trimestreSeleccionado}
          onChange={(e) => setTrimestreSeleccionado(e.target.value)}
          sx={{
            width: 220,
            backgroundColor: "#f0f4f8",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontWeight: "bold",
          }}
        >
          {Object.entries(nombreTrimestreMap).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          sx={{ height: 56, backgroundColor: "#1ee59fff" }}
          onClick={handleVerReporte}
        >
          Ver Reporte
        </Button>
      </Box>

      {/* Tabla de estudiantes */}
      <TableContainer component={MuiPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Estudiante</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estudiantes.map((est) => (
              <TableRow key={est.id}>
                <TableCell>{est.nombre}</TableCell>
                <TableCell align="center">
                  <TextField
                    value={notas[est.id] || ""}
                    onChange={(e) => handleNotaChange(est.id, e.target.value)}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleGuardar}>
          Guardar Calificaciones
        </Button>
      </Box>
    </Box>
  );
}
