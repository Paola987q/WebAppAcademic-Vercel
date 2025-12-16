import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ClassIcon from "@mui/icons-material/Class";
import EditIcon from "@mui/icons-material/Edit";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ListCursos() {
  const [sections, setSections] = useState([]);
  const [docentesMap, setDocentesMap] = useState({});
  const [asignaturasMap, setAsignaturasMap] = useState({});
  const [asignaturasList, setAsignaturasList] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroAsignatura, setFiltroAsignatura] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const ordenGrados = [
    "1 inicial", "2 inicial", "3 inicial",
    "1ro básica", "2do básica", "3ro básica",
    "4to básica", "5to básica", "6to básica",
    "7mo básica", "8vo básica", "9no básica", "10mo básica",
    "1ro bachillerato", "2do bachillerato", "3ro bachillerato",
  ];

  const fetchData = async () => {
    try {
      // DOCENTES
      const docentesSnap = await getDocs(collection(db, "Docentes"));
      const docentesTemp = {};
      docentesSnap.forEach((doc) => {
        docentesTemp[doc.id] = doc.data().nombre;
      });
      setDocentesMap(docentesTemp);

      // ASIGNATURAS
      const asignSnap = await getDocs(collection(db, "Asignaturas"));
      const asignTemp = {};
      const asignList = [];
      asignSnap.forEach((doc) => {
        asignTemp[doc.id] = doc.data().nombre;
        asignList.push({ id: doc.id, nombre: doc.data().nombre });
      });
      setAsignaturasMap(asignTemp);
      setAsignaturasList(asignList);

      // CURSOS
      const cursosSnap = await getDocs(collection(db, "Cursos"));
      const cursos = cursosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {};
      cursos.forEach((curso) => {
        if (!grouped[curso.grado]) grouped[curso.grado] = [];
        grouped[curso.grado].push(curso);
      });

      const tempSections = ordenGrados
        .filter((g) => grouped[g])
        .map((g) => ({
          title: g,
          data: grouped[g],
        }));

      setSections(tempSections);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditarCurso = (id) => {
    navigate(`/admin/editcursos/${id}`);
  };

  // FILTROS
  const filtrarCursos = (sections) => {
    return sections
      .filter((sec) => !filtroGrado || sec.title === filtroGrado)
      .map((sec) => ({
        ...sec,
        data: sec.data.filter((curso) => {
          if (filtroCurso) {
            const paralelo = curso.paralelo?.toLowerCase() || "";
            if (!paralelo.includes(filtroCurso.toLowerCase())) return false;
          }
          if (filtroAsignatura && curso.asignaturaId !== filtroAsignatura) return false;
          return true;
        }),
      }))
      .filter((sec) => sec.data.length > 0);
  };

  const sectionsFiltradas = filtrarCursos(sections);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
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
          p: isMobile ? 2 : 5,
          borderRadius: 4,
          boxShadow: 4,
          width: "100%",
          maxWidth: isMobile ? "100%" : "1200px",
          margin: "0 auto",
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          textAlign="center"
          mb={3}
        >
          Lista de Cursos
        </Typography>

        {/* PANEL DE FILTROS */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: "12px" }} elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} sx={{ minWidth: 260 }}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por grado</InputLabel>
                <Select
                  label="Filtrar por grado"
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ordenGrados.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} sx={{ minWidth: 260 }}>
              <TextField
                fullWidth
                label="Buscar curso (paralelo)"
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4} sx={{ minWidth: 260 }}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por asignatura</InputLabel>
                <Select
                  label="Filtrar por asignatura"
                  value={filtroAsignatura}
                  onChange={(e) => setFiltroAsignatura(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {asignaturasList.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* LISTA */}
        {sectionsFiltradas.length === 0 ? (
          <Typography textAlign="center" mt={5}>
            No se encontraron cursos.
          </Typography>
        ) : (
          sectionsFiltradas.map((section) => (
            <Box key={section.title} mb={4}>
              <Typography
                variant="h6"
                sx={{
                  background: "#007BFF",
                  color: "white",
                  p: 1.2,
                  borderRadius: "8px",
                  mb: 2,
                }}
              >
                {section.title}
              </Typography>

              <Grid container spacing={2}>
                {section.data.map((curso) => (
                  <Grid key={curso.id} item xs={12} sm={6} md={4}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                      }}
                      onClick={() => handleEditarCurso(curso.id)}
                    >
                      <ClassIcon sx={{ fontSize: 40, color: "#007BFF" }} />

                      <Box flex={1}>
                        <Typography fontWeight={600}>
                          Paralelo: {curso.paralelo}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Asignatura: {asignaturasMap[curso.asignaturaId] || "Desconocida"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Docente: {docentesMap[curso.docenteId] || "Desconocido"}
                        </Typography>
                      </Box>

                      <IconButton>
                        <EditIcon sx={{ color: "#007BFF" }} />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Grid>
    </Grid>
  );
}
