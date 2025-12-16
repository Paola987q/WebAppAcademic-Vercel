// src/presentation/screens/admin/EliminarCurso.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import ClassIcon from "@mui/icons-material/Class";

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EliminarCursos() {
  const [cursos, setCursos] = useState([]);
  const [docentesMap, setDocentesMap] = useState({});
  const [asignaturasMap, setAsignaturasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, cursoId: null });

  const [filtro, setFiltro] = useState({
    grado: "",
    paralelo: "",
    docenteId: "",
    asignaturaId: "",
  });

  const ordenGrados = [
    "1 inicial","2 inicial","3 inicial",
    "1ro básica","2do básica","3ro básica","4to básica","5to básica",
    "6to básica","7mo básica","8vo básica","9no básica","10mo básica",
    "1ro bachillerato","2do bachillerato","3ro bachillerato"
  ];

  const fetchReferencias = async () => {
    const docentesSnap = await getDocs(collection(db, "Docentes"));
    const docentesData = {};
    docentesSnap.forEach(doc => { docentesData[doc.id] = doc.data().nombre; });
    setDocentesMap(docentesData);

    const asignaturasSnap = await getDocs(collection(db, "Asignaturas"));
    const asignaturasData = {};
    asignaturasSnap.forEach(doc => { asignaturasData[doc.id] = doc.data().nombre; });
    setAsignaturasMap(asignaturasData);
  };

  const fetchCursos = async () => {
    try {
      setLoading(true);
      await fetchReferencias();

      const snapshot = await getDocs(collection(db, "Cursos"));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      const grouped = {};
      data.forEach(curso => {
        if (!grouped[curso.grado]) grouped[curso.grado] = [];
        grouped[curso.grado].push(curso);
      });

      const orderedCursos = ordenGrados
        .filter(grado => grouped[grado])
        .map(grado => ({ grado, cursos: grouped[grado] }));

      setCursos(orderedCursos);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error al cargar los cursos");
    }
  };

  useEffect(() => { fetchCursos(); }, []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "Cursos", deleteDialog.cursoId));
      setDeleteDialog({ open: false, cursoId: null });

      // Actualizar la lista de cursos en pantalla
      setCursos(prevCursos =>
        prevCursos.map(gradoObj => ({
          ...gradoObj,
          cursos: gradoObj.cursos.filter(c => c.id !== deleteDialog.cursoId)
        }))
      );

    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el curso");
    }
  };

  // Aplicar filtros
  const cursosFiltrados = cursos.map(gradoObj => ({
    ...gradoObj,
    cursos: gradoObj.cursos.filter(curso => 
      (!filtro.grado || curso.grado === filtro.grado) &&
      (!filtro.paralelo || curso.paralelo.toLowerCase().includes(filtro.paralelo.toLowerCase())) &&
      (!filtro.docenteId || curso.docenteId === filtro.docenteId) &&
      (!filtro.asignaturaId || curso.asignaturaId === filtro.asignaturaId)
    )
  })).filter(gradoObj => gradoObj.cursos.length > 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        borderRadius: { xs: 0, md: 4 },
        boxShadow: { md: 3 },
        maxWidth: "1200px",
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Eliminar Cursos
      </Typography>

      {/* FILTROS */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField
          select
          label="Grado"
          sx={{ flex: 1, minWidth: 150 }}
          value={filtro.grado}
          onChange={e => setFiltro(prev => ({ ...prev, grado: e.target.value }))}
        >
          <MenuItem value="">Todos</MenuItem>
          {ordenGrados.map(grado => (
            <MenuItem key={grado} value={grado}>{grado}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Paralelo"
          sx={{ flex: 1, minWidth: 150 }}
          value={filtro.paralelo}
          onChange={e => setFiltro(prev => ({ ...prev, paralelo: e.target.value }))}
          placeholder="Ej: A, B, C"
        />

        <TextField
          select
          label="Docente"
          sx={{ flex: 1, minWidth: 150 }}
          value={filtro.docenteId}
          onChange={e => setFiltro(prev => ({ ...prev, docenteId: e.target.value }))}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(docentesMap).map(([id, nombre]) => (
            <MenuItem key={id} value={id}>{nombre}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Asignatura"
          sx={{ flex: 1, minWidth: 150 }}
          value={filtro.asignaturaId}
          onChange={e => setFiltro(prev => ({ ...prev, asignaturaId: e.target.value }))}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(asignaturasMap).map(([id, nombre]) => (
            <MenuItem key={id} value={id}>{nombre}</MenuItem>
          ))}
        </TextField>
      </Box>

      {cursosFiltrados.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No hay cursos que coincidan con el filtro
        </Typography>
      ) : (
        cursosFiltrados.map(({ grado, cursos }) => (
          <Box key={grado} mb={4}>
            <Typography variant="h5" color="primary" mb={2}>
              {grado}
            </Typography>

            <Grid container spacing={2}>
              {cursos.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ClassIcon color="primary" />
                        <Typography ml={1} variant="subtitle1">
                          {item.grado} - {item.paralelo}
                        </Typography>
                      </Box>

                      <Typography variant="body2">
                        <strong>Asignatura:</strong> {asignaturasMap[item.asignaturaId] || "Desconocida"}
                      </Typography>

                      <Typography variant="body2">
                        <strong>Docente:</strong> {docentesMap[item.docenteId] || "Desconocido"}
                      </Typography>

                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setDeleteDialog({ open: true, cursoId: item.id })}
                      >
                        Eliminar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, cursoId: null })}
      >
        <DialogTitle>¿Estás seguro de eliminar este curso?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, cursoId: null })}>
            Cancelar
          </Button>
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
