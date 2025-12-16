// src/presentation/screens/docente/ReporteCalificaciones.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function ReporteCalificaciones() {
  const [searchParams] = useSearchParams();
  const grado = searchParams.get("grado");
  const paralelo = searchParams.get("paralelo");
  const trimestre = searchParams.get("trimestre");

  const [loading, setLoading] = useState(true);
  const [estudiantesConNotas, setEstudiantesConNotas] = useState([]);

  const nombreTrimestreMap = {
    trimestre1: "1er Trimestre",
    trimestre2: "2do Trimestre",
    trimestre3: "3er Trimestre",
  };

  useEffect(() => {
    const fetchDatos = async () => {
      if (!grado || !paralelo || !trimestre) return;

      try {
        const q = query(
          collection(db, "Estudiantes"),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );
        const snapshot = await getDocs(q);

        const lista = [];
        for (const estDoc of snapshot.docs) {
          const califDocRef = doc(db, "Estudiantes", estDoc.id, "Calificaciones", trimestre);
          const califSnap = await getDoc(califDocRef);

          lista.push({
            id: estDoc.id,
            nombre: estDoc.data().nombre,
            nota: califSnap.exists() ? califSnap.data().nota : null,
          });
        }

        setEstudiantesConNotas(lista);
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las calificaciones");
      }
      setLoading(false);
    };

    fetchDatos();
  }, [grado, paralelo, trimestre]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  if (!estudiantesConNotas.length) {
    return (
      <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
        No hay estudiantes registrados en este curso.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          color: "#050505ff",
        }}
      >
        Reporte de Calificaciones - {nombreTrimestreMap[trimestre] || trimestre}
      </Typography>

      <TableContainer component={MuiPaper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f4f8" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Estudiante</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Nota
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estudiantesConNotas.map((est) => (
              <TableRow key={est.id}>
                <TableCell sx={{ fontWeight: "500" }}>{est.nombre}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "500", color: est.nota === null ? "#888" : "#000" }}>
                  {est.nota !== null ? est.nota : "Sin calificación"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
