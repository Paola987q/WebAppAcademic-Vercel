// src/presentation/screens/docente/DocentAdminTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v7 Grid
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import BookIcon from "@mui/icons-material/Book";
import ClassIcon from "@mui/icons-material/Class";
import GradeIcon from "@mui/icons-material/Grade";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function DocentAdminTab() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [asignaturas, setAsignaturas] = useState([]);

  useEffect(() => {
    const loadAsignaturas = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const cursosQuery = query(
        collection(db, "Cursos"),
        where("docenteId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(cursosQuery, async (cursosSnap) => {
        if (cursosSnap.empty) {
          setAsignaturas([]);
          setLoading(false);
          return;
        }

        const asignaturaIdsSet = new Set();

        cursosSnap.forEach((cursoDoc) => {
          const data = cursoDoc.data();
          if (data.asignaturaId) {
            asignaturaIdsSet.add(
              JSON.stringify({
                asignaturaId: data.asignaturaId,
                paralelo: data.paralelo || "Sin paralelo",
                grado: data.grado || "No definido",
              })
            );
          }
        });

        const asignaturasUnique = Array.from(asignaturaIdsSet).map((item) => JSON.parse(item));

        const listaAsignaturas = await Promise.all(
          asignaturasUnique.map(async (item) => {
            const snap = await getDoc(doc(db, "Asignaturas", item.asignaturaId));
            if (snap.exists()) {
              return {
                id: snap.id,
                nombre: snap.data().nombre,
                paralelo: item.paralelo,
                grado: item.grado,
              };
            }
            return null;
          })
        );

        const listaAsignaturasFiltradas = listaAsignaturas.filter(Boolean);

        const ordenGrados = [
          "7mo","8vo","9no","10mo",
          "1ro Bachillerato","2do Bachillerato","3ro Bachillerato"
        ];

        const getOrdenGrado = (grado) => {
          const index = ordenGrados.indexOf(grado);
          return index === -1 ? 999 : index;
        };

        listaAsignaturasFiltradas.sort((a, b) => {
          const ordenA = getOrdenGrado(a.grado);
          const ordenB = getOrdenGrado(b.grado);
          if (ordenA !== ordenB) return ordenA - ordenB;
          return a.paralelo.localeCompare(b.paralelo);
        });

        setAsignaturas(listaAsignaturasFiltradas);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    loadAsignaturas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Cargando asignaturas...</Typography>
      </Box>
    );
  }

  const asignaturasPorGrado = asignaturas.reduce((acc, asig) => {
    if (!acc[asig.grado]) acc[asig.grado] = [];
    acc[asig.grado].push(asig);
    return acc;
  }, {});

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
        Asignaturas Asignadas
      </Typography>

      {asignaturas.length === 0 ? (
        <Typography sx={{ opacity: 0.7, textAlign: "center" }}>
          No tienes asignaturas asignadas aún.
        </Typography>
      ) : (
        Object.entries(asignaturasPorGrado).map(([grado, lista]) => (
          <Box key={grado} sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2, textAlign: "left", color: "#1976d2" }}
            >
              {grado}
            </Typography>

            <Grid container spacing={2}>
              {lista.map((asig) => (
                <Grid key={`${asig.id}-${asig.paralelo}-${asig.grado}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BookIcon fontSize="large" color="primary" />
                      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{asig.nombre}</Typography>
                    </Box>

                    <Typography sx={{ fontSize: 16 }}>
                      Paralelo: <b>{asig.paralelo}</b>
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<ClassIcon />}
                        onClick={() =>
                          navigate("/docente/asistencia", {
                            state: { asignaturaId: asig.id, nombre: asig.nombre, grado: asig.grado, paralelo: asig.paralelo, regresarATab: 1 },
                          })
                        }
                      >
                        Asistencia
                      </Button>

                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<GradeIcon />}
                        onClick={() =>
                          navigate("/docente/calificaciones", {
                            state: { asignaturaId: asig.id, nombre: asig.nombre, grado: asig.grado, paralelo: asig.paralelo, trimestre: "1er Trimestre", regresarATab: 1 },
                          })
                        }
                      >
                        Calificaciones
                      </Button>

                      <Button
                      variant="contained"
                      color="warning"
                      startIcon={<AssignmentIcon />}
                      onClick={() =>
                        navigate("/docente/tareas-seleccion", {
                          state: { asignaturaId: asig.id, nombre: asig.nombre, grado: asig.grado, paralelo: asig.paralelo, regresarATab: 1,},
                        })
                        }
                      >
                        Tareas
                      </Button>

                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Box>
  );
}
