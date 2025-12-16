import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Radio,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function Asistencia() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Datos recibidos desde navegación
  const { asignaturaId, nombre, grado, paralelo } = location.state || {};
  const regresarATab = location.state?.regresarATab ?? 1;

  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [fecha, setFecha] = useState("");
  const [editable, setEditable] = useState(true);

  useEffect(() => {
    if (!grado || !paralelo || !asignaturaId) {
      setLoading(false);
      return;
    }

    // 📅 Fecha actual (yyyy-mm-dd) — igual que mobile
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaFormato = `${yyyy}-${mm}-${dd}`;
    setFecha(fechaFormato);

    const fetchData = async () => {
      try {
        // 1️⃣ Obtener estudiantes del curso
        const estudiantesQuery = query(
          collection(db, "Estudiantes"),
          where("grado", "==", grado.trim()),
          where("paralelo", "==", paralelo.trim())
        );

        const snapshot = await getDocs(estudiantesQuery);

        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // 2️⃣ Obtener asistencias ya registradas del día
        const asistenciasQuery = query(
          collection(db, "Asistencias"),
          where("fecha", "==", fechaFormato),
          where("asignaturaId", "==", asignaturaId)
        );

        const asistenciasSnap = await getDocs(asistenciasQuery);

        const asistenciaMap = {};
        asistenciasSnap.docs.forEach((docu) => {
          const data = docu.data();
          asistenciaMap[data.estudianteId] = data.estado;
        });

        // 3️⃣ Inicializar estados (por defecto Presente)
        const asistenciaInicial = {};
        lista.forEach((est) => {
          asistenciaInicial[est.id] =
            asistenciaMap[est.id] || "Presente";
        });

        setEstudiantes(lista);
        setAsistencia(asistenciaInicial);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando asistencia:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [grado, paralelo, asignaturaId]);

  const handleChange = (id, valor) => {
    if (!editable) return;
    setAsistencia((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  // ✅ GUARDADO IGUAL A REACT NATIVE
  const handleGuardar = async () => {
    if (!editable) {
      alert("Ya no se puede modificar la asistencia.");
      return;
    }

    try {
      const fechaSolo = fecha; // yyyy-mm-dd

      const promises = estudiantes.map((est) => {
        const estado = asistencia[est.id] || "Sin seleccionar";

        return setDoc(
          doc(db, "Asistencias", `${est.id}_${fechaSolo}_${asignaturaId}`),
          {
            estudianteId: est.id,
            estudianteNombre: est.nombre,

            // 📌 Curso
            grado,
            paralelo,

            fecha: fechaSolo,
            estado,

            // 📌 Asignatura
            asignaturaId,
            asignaturaNombre: nombre,

          }
        );
      });

      await Promise.all(promises);

      alert("Asistencia guardada correctamente");

      navigate("/docente/dashboard", {
        state: { tab: regresarATab },
        replace: true,
      });
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      alert("Error guardando asistencia");
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Cargando estudiantes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button
        onClick={() =>
          navigate("/docente/dashboard", {
            state: { tab: regresarATab },
            replace: true,
          })
        }
        sx={{ mb: 3 }}
      >
        ← Regresar
      </Button>

      <Typography
        variant="h4"
        sx={{ textAlign: "center", fontWeight: "bold", mb: 1 }}
      >
        Asistencia: {nombre}
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ textAlign: "center", mb: 3, color: "text.secondary" }}
      >
        {grado} {paralelo} — Fecha:{" "}
        {fecha.split("-").reverse().join("/")}
      </Typography>

      <TableContainer
        component={MuiPaper}
        sx={{ maxHeight: 500, borderRadius: 2 }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><b>Estudiante</b></TableCell>
              <TableCell align="center"><b>Presente</b></TableCell>
              <TableCell align="center"><b>Atraso</b></TableCell>
              <TableCell align="center"><b>F. Justificada</b></TableCell>
              <TableCell align="center"><b>F. Injustificada</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {estudiantes.map((est) => (
              <TableRow key={est.id}>
                <TableCell>{est.nombre}</TableCell>

                {[
                  "Presente",
                  "Atraso",
                  "Falta Justificada",
                  "Falta Injustificada",
                ].map((estado) => (
                  <TableCell align="center" key={estado}>
                    <Radio
                      checked={asistencia[est.id] === estado}
                      onChange={() =>
                        handleChange(est.id, estado)
                      }
                      disabled={!editable}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={!editable}
        >
          Guardar Asistencia
        </Button>
      </Box>
    </Box>
  );
}
