import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  TextField,
  CircularProgress,
  IconButton,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

import { useNavigate } from "react-router-dom";

export default function ListEst() {
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState("");

  const [cursos, setCursos] = useState([]);
  const [cursoIDaGrado, setCursoIDaGrado] = useState({});
  const [paralelos, setParalelos] = useState([]);

  // =========================
  // CARGAR CURSOS
  // =========================
  const fetchCursos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Cursos"));

      const cursosAgrupados = {};
      const mapaCursoIDaGrado = {};

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const grado = data.grado || "Sin grado";

        mapaCursoIDaGrado[docSnap.id] = grado;

        if (!cursosAgrupados[grado]) {
          cursosAgrupados[grado] = [];
        }
        cursosAgrupados[grado].push(docSnap.id);
      });

      const listaCursos = Object.entries(cursosAgrupados).map(([grado]) => ({
        grado,
      }));

      setCursos(listaCursos);
      setCursoIDaGrado(mapaCursoIDaGrado);
    } catch (error) {
      alert("Error al cargar cursos");
    }
  };

  // =========================
  // CARGAR PARALELOS
  // =========================
  const fetchParalelos = async () => {
    try {
      const snap = await getDocs(collection(db, "Estudiantes"));
      const paralelosUnicos = snap.docs
        .map((doc) => doc.data().paralelo)
        .filter((p, i, arr) => p && arr.indexOf(p) === i);

      setParalelos(paralelosUnicos);
    } catch (error) {
      alert("Error cargando paralelos");
    }
  };

  // =========================
  // CARGAR ESTUDIANTES
  // =========================
  const fetchEstudiantes = async () => {
    setLoading(true);

    try {
      const snap = await getDocs(collection(db, "Estudiantes"));

      const lista = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          grado: cursoIDaGrado[data.cursoId] || "Sin grado",
        };
      });

      const filtrados = lista.filter((est) => {
        if (cursoSeleccionado && est.grado !== cursoSeleccionado) return false;
        if (paraleloSeleccionado && est.paralelo !== paraleloSeleccionado)
          return false;
        return true;
      });

      setEstudiantes(filtrados);
    } catch (error) {
      alert("Error cargando estudiantes");
    }

    setLoading(false);
  };

  // Inicial
  useEffect(() => {
    const cargar = async () => {
      await fetchCursos();
      await fetchParalelos();
    };
    cargar();
  }, []);

  // Actualizar cuando cambia algo
  useEffect(() => {
    if (Object.keys(cursoIDaGrado).length > 0) {
      fetchEstudiantes();
    }
  }, [cursoSeleccionado, paraleloSeleccionado, cursoIDaGrado]);

  const handleEditar = (id) => {
    navigate(`/admin/EditEst/${id}`);
  };

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
          textAlign="center"
          mb={4}
          fontWeight="bold"
        >
          Lista de Estudiantes
        </Typography>

        {/* FILTRO GRADO */}
        <TextField
          select
          fullWidth
          label="Seleccionar grado"
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            style: { fontSize: isMobile ? 15 : 18 },
          }}
          InputLabelProps={{
            style: { fontSize: isMobile ? 14 : 17 },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {cursos.map((c, idx) => (
            <MenuItem key={idx} value={c.grado}>
              {c.grado}
            </MenuItem>
          ))}
        </TextField>

        {/* FILTRO PARALELO */}
        <TextField
          select
          fullWidth
          label="Seleccionar paralelo"
          value={paraleloSeleccionado}
          onChange={(e) => setParaleloSeleccionado(e.target.value)}
          InputProps={{
            style: { fontSize: isMobile ? 15 : 18 },
          }}
          InputLabelProps={{
            style: { fontSize: isMobile ? 14 : 17 },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {paralelos.map((p, idx) => (
            <MenuItem key={idx} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        {/* LOADING */}
        {loading ? (
          <Grid container justifyContent="center" mt={5}>
            <CircularProgress />
          </Grid>
        ) : estudiantes.length === 0 ? (
          <Typography textAlign="center" mt={5} fontSize={18}>
            No hay estudiantes registrados.
          </Typography>
        ) : (
          estudiantes.map((est) => (
            <Card
              key={est.id}
              sx={{
                mt: 3,
                p: isMobile ? 1.5 : 3,
                borderRadius: 4,
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Grid container alignItems="center">
                  <Grid item>
                    <PersonIcon
                      color="primary"
                      sx={{ fontSize: isMobile ? 35 : 50, mr: 3 }}
                    />
                  </Grid>

                  <Grid item xs>
                    <Typography
                      variant={isMobile ? "h6" : "h6"}
                      fontWeight="bold"
                    >
                      {est.nombre}
                    </Typography>
                    <Typography fontSize={isMobile ? 13 : 15}>
                      Cédula: {est.cedula}
                    </Typography>
                    <Typography fontSize={isMobile ? 13 : 15}>
                      Grado: {est.grado}
                    </Typography>
                    <Typography fontSize={isMobile ? 13 : 15}>
                      Paralelo: {est.paralelo}
                    </Typography>
                  </Grid>

                  {/* ICONO EDITAR CON BOX */}
                  <Grid item>
                    <Box sx={{ ml: isMobile ? 0 : 80 }}>
                      <IconButton
                        onClick={() => handleEditar(est.id)}
                        sx={{
                          p: isMobile ? 1.5 : 2.3,
                          borderRadius: 3,
                        }}
                      >
                        <EditIcon
                          color="primary"
                          sx={{ fontSize: isMobile ? 30 : 38 }}
                        />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Grid>
    </Grid>
  );
}
