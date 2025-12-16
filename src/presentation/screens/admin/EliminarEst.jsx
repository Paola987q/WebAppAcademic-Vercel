import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EliminarEst() {
  const [estudiantesFull, setEstudiantesFull] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedParalelo, setSelectedParalelo] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // -------------------------
  // 🔥 CARGAR ESTUDIANTES + CURSOS
  // -------------------------
  const fetchData = async () => {
    try {
      const estSnap = await getDocs(collection(db, "Estudiantes"));
      const cursosSnap = await getDocs(collection(db, "Cursos"));

      const estData = estSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const cursosData = cursosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setCursos(cursosData);

      // Combinar estudiante con información del curso
      const combined = estData.map((est) => {
        const curso = cursosData.find((c) => c.id === est.cursoId);
        return {
          ...est,
          grado: curso?.grado || "No definido",
          paralelo: curso?.paralelo || "No definido",
        };
      });

      setEstudiantesFull(combined);
      setFiltered(combined);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------
  // 🔍 FILTROS
  // -------------------------
  const grados = [...new Set(estudiantesFull.map((e) => e.grado))].filter(Boolean);
  const paralelos = [...new Set(estudiantesFull.map((e) => e.paralelo))].filter(Boolean);

  useEffect(() => {
    let result = estudiantesFull;

    if (selectedGrado) result = result.filter((e) => e.grado === selectedGrado);
    if (selectedParalelo) result = result.filter((e) => e.paralelo === selectedParalelo);

    setFiltered(result);
  }, [selectedGrado, selectedParalelo, estudiantesFull]);

  // -------------------------
  // 🗑 ELIMINAR
  // -------------------------
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "Estudiantes", selectedId));
      setOpenDialog(false);
      fetchData(); // recargar lista
    } catch (error) {
      console.log("Error eliminando:", error);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh", p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "white",
          borderRadius: 3,
          p: 4,
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* TÍTULO */}
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
          Eliminar Estudiante
        </Typography>

        {/* FILTROS */}
        <Grid container spacing={3} mb={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              select
              label="Grado"
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              sx={{ minWidth: "220px" }}
            >
              <MenuItem value="">Todos</MenuItem>
              {grados.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              select
              label="Paralelo"
              value={selectedParalelo}
              onChange={(e) => setSelectedParalelo(e.target.value)}
              sx={{ minWidth: "220px" }}
            >
              <MenuItem value="">Todos</MenuItem>
              {paralelos.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* LISTA DE ESTUDIANTES */}
        {filtered.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            No se encontraron estudiantes.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography variant="h6" mt={1}>
                      {item.nombre}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      <strong>Grado:</strong> {item.grado}
                    </Typography>
                    <Typography variant="body2" mt={1} mb={2}>
                      <strong>Paralelo:</strong> {item.paralelo}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setSelectedId(item.id);
                        setOpenDialog(true);
                      }}
                    >
                      Eliminar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* DIALOGO */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Eliminar Estudiante</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar este estudiante?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
