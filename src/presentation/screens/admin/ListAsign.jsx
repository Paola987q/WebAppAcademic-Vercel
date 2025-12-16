// src/presentation/screens/admin/ListAsign.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Grid,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import BookIcon from "@mui/icons-material/Book";
import SearchIcon from "@mui/icons-material/Search";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ListAsign() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [docentesMap, setDocentesMap] = useState({});
  const [cursosMap, setCursosMap] = useState({});

  /** CARGA DOCENTES */
  const loadDocentes = async () => {
    const snap = await getDocs(collection(db, "Docentes"));
    const map = {};
    snap.docs.forEach((d) => {
      map[d.id] = d.data().nombre || "Sin nombre";
    });
    setDocentesMap(map);
  };

  /** CARGA CURSOS */
  const loadCursos = async () => {
    const snap = await getDocs(collection(db, "Cursos"));
    const map = {};
    snap.docs.forEach((d) => {
      map[d.id] = d.data();
    });
    setCursosMap(map);
  };

  /** CARGA ASIGNATURAS */
  const loadAsignaturas = async () => {
    const snap = await getDocs(collection(db, "Asignaturas"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAsignaturas(list);
    setFiltered(list);
  };

  /** CARGA TODO */
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await loadDocentes(); // primero docentes
      await loadCursos();   // luego cursos
      await loadAsignaturas();
      setLoading(false);
    };
    loadAll();
  }, []);

  /** BUSCADOR */
  const handleSearch = (text) => {
    setSearch(text);
    const result = asignaturas.filter((a) =>
      a.nombre.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(result);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando asignaturas...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        py: isMobile ? 2 : 4,
        px: isMobile ? 2 : 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          bgcolor: "#fff",
          p: isMobile ? 3 : 5,
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ mb: 3 }}
          textAlign="center"
        >
          Lista de Asignaturas
        </Typography>

        {/* BUSCADOR */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon sx={{ color: "#1976d2" }} />
          <TextField
            fullWidth
            placeholder="Buscar asignatura..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            size={isMobile ? "small" : "medium"}
          />
        </Box>

        {/* LISTA */}
        <Grid container spacing={3}>
          {filtered.map((item) => {
            const curso = Object.values(cursosMap).find(
              (c) => c.asignaturaId === item.id
            );
            const docenteNombre = curso
              ? docentesMap[curso.docenteId] || "Sin docente"
              : "Sin docente";

            return (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* ICONO */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BookIcon
                          sx={{ fontSize: 30, color: "#1976d2", mr: 1 }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {item.nombre}
                          </Typography>
                          <Typography sx={{ color: "gray" }}>
                            Curso: {curso?.grado || "No asignado"}{" "}
                            {curso?.paralelo || ""}
                          </Typography>
                          <Typography sx={{ color: "gray" }}>
                            Docente: {docenteNombre}
                          </Typography>
                        </Box>
                      </Box>

                      {/* EDITAR */}
                      <IconButton
                        onClick={() => navigate(`/admin/editasignatura/${item.id}`)}
                        sx={{
                          backgroundColor: "#e3f2fd",
                          "&:hover": { backgroundColor: "#bbdefb" },
                        }}
                      >
                        <EditIcon sx={{ color: "#1976d2" }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filtered.length === 0 && (
          <Typography
            sx={{ mt: 4, textAlign: "center", color: "gray" }}
          >
            No se encontraron asignaturas.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
