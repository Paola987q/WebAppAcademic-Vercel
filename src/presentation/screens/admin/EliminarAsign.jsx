// src/presentation/screens/admin/EliminarAsignatura.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

export default function EliminarAsignatura() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, asignaturaId: null });
  const [filtroNombre, setFiltroNombre] = useState('');

  const fetchAsignaturas = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'Asignaturas'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAsignaturas(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  const handleEliminar = async () => {
    try {
      await deleteDoc(doc(db, 'Asignaturas', deleteDialog.asignaturaId));
      setAsignaturas(prev => prev.filter(a => a.id !== deleteDialog.asignaturaId));
      setDeleteDialog({ open: false, asignaturaId: null });
    } catch (error) {
      console.log(error);
      setDeleteDialog({ open: false, asignaturaId: null });
    }
  };

  // Filtrar asignaturas por nombre
  const asignaturasFiltradas = asignaturas.filter(a =>
    a.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        borderRadius: { xs: 0, md: 4 },
        boxShadow: { md: 3 },
        maxWidth: '1200px',
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Eliminar Asignaturas
      </Typography>

      {/* Filtro */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField
          label="Buscar por nombre"
          fullWidth
          sx={{ flex: 1, minWidth: 200 }}
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          placeholder="Escribe el nombre de la asignatura..."
        />
      </Box>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
          <CircularProgress />
          <Typography mt={2}>Cargando asignaturas...</Typography>
        </Box>
      ) : asignaturasFiltradas.length === 0 ? (
        <Typography align="center" mt={5}>
          No hay asignaturas que coincidan con el filtro.
        </Typography>
      ) : (
        <Grid container spacing={3} mt={2}>
          {asignaturasFiltradas.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '120px',
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <BookIcon color="primary" />
                  <Typography variant="h6">{item.nombre}</Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog({ open: true, asignaturaId: item.id })}
                >
                  Eliminar
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de confirmación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, asignaturaId: null })}
      >
        <DialogTitle>¿Estás seguro de eliminar esta asignatura?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, asignaturaId: null })}>
            Cancelar
          </Button>
          <Button color="error" onClick={handleEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
