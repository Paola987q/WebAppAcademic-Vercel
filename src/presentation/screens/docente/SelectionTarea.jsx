// src/presentation/screens/docente/SelectionTarea.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";

import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

export default function SelectionTarea() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    asignaturaId,
    nombre,
    grado,
    paralelo,
    regresarATab = 1,
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [nombreAsignatura, setNombreAsignatura] = useState(nombre || "");

  // 🔹 Recuperar nombre de asignatura si no viene en el state
  useEffect(() => {
    const fetchAsignatura = async () => {
      if (!nombreAsignatura && asignaturaId) {
        try {
          const snap = await getDoc(doc(db, "Asignaturas", asignaturaId));
          if (snap.exists()) {
            setNombreAsignatura(snap.data().nombre);
          } else {
            setNombreAsignatura("Asignatura desconocida");
          }
        } catch (error) {
          console.error("Error obteniendo asignatura:", error);
          setNombreAsignatura("Asignatura desconocida");
        }
      }
    };

    fetchAsignatura();
  }, [asignaturaId, nombreAsignatura]);

  // 🔹 Cargar tareas
  useEffect(() => {
    if (!asignaturaId || !grado || !paralelo) {
      setLoading(false);
      return;
    }

    const fetchTareas = async () => {
      try {
        const uid = auth.currentUser.uid;

        // 1️⃣ Buscar curso
        const cursoQuery = query(
          collection(db, "Cursos"),
          where("docenteId", "==", uid),
          where("asignaturaId", "==", asignaturaId),
          where("grado", "==", grado),
          where("paralelo", "==", paralelo)
        );

        const cursoSnap = await getDocs(cursoQuery);

        if (cursoSnap.empty) {
          setTareas([]);
          setLoading(false);
          return;
        }

        const cursoId = cursoSnap.docs[0].id;

        // 2️⃣ Obtener tareas
        const tareasSnap = await getDocs(
          collection(db, "Cursos", cursoId, "Tareas")
        );

        const hoy = new Date();

        const lista = tareasSnap.docs
          .map((doc) => {
            const data = doc.data();
            const fecha = new Date(data.fechaEntrega);

            // Diferencia en días
            const diffDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

            let estado = "con-tiempo";
            if (diffDias < 0) estado = "vencida";
            else if (diffDias <= 2) estado = "por-vencer";

            return {
              id: doc.id,
              ...data,
              fechaDate: fecha,
              estado,
              diffDias,
            };
          })
          // Ordenar por fecha
          .sort((a, b) => a.fechaDate - b.fechaDate);

        setTareas(lista);
      } catch (error) {
        console.error("Error cargando tareas:", error);
        alert("No se pudieron cargar las tareas");
      } finally {
        setLoading(false);
      }
    };

    fetchTareas();
  }, [asignaturaId, grado, paralelo]);

  const getColor = (estado) => {
    switch (estado) {
      case "vencida":
        return "#f8d7da";
      case "por-vencer":
        return "#fff3cd";
      default:
        return "#d4edda";
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando tareas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 1.5, textAlign: "center" }}
      >
        Lista de Tareas
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
      >
        {nombreAsignatura}
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ textAlign: "center", mb: 4, color: "text.secondary" }}
      >
        {grado} {paralelo}
      </Typography>

      {tareas.length === 0 ? (
        <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
          No existen tareas registradas.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {tareas.map((tarea) => (
            <Paper
              key={tarea.id}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                backgroundColor: getColor(tarea.estado),
                "&:hover": { opacity: 0.9 },
              }}
              onClick={() =>
                navigate("/docente/calificar-tarea", {
                  state: {
                    tareaId: tarea.id,
                    asignaturaId,
                    grado,
                    paralelo,
                    regresarATab,
                  },
                })
              }
            >
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                {tarea.titulo}
              </Typography>

              <Typography sx={{ fontSize: 14 }}>
                📅 Entrega: {tarea.fechaEntrega}
              </Typography>

              <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                {tarea.estado === "vencida" && "🔴 Tarea vencida"}
                {tarea.estado === "por-vencer" && "🟡 Por vencer"}
                {tarea.estado === "con-tiempo" && "🟢 Con tiempo"}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
