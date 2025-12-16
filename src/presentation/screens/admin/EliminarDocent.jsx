// src/presentation/screens/admin/EliminarDocente.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EliminarDocente() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [search, setSearch] = useState("");

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "Docentes"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDocentes(data);
    } catch (error) {
      console.error("Error fetching docentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const handleDeleteClick = (docente) => {
    setSelectedDocente(docente);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocente) return;
    try {
      await deleteDoc(doc(db, "Docentes", selectedDocente.id));
      setOpenDialog(false);
      setSelectedDocente(null);
      fetchDocentes();
    } catch (error) {
      console.error("Error eliminando docente:", error);
      setOpenDialog(false);
      setSelectedDocente(null);
    }
  };

  const filtered = docentes.filter((d) => {
    const s = search.toLowerCase();
    return (
      d.nombre?.toLowerCase().includes(s) ||
      d.cedula?.toLowerCase().includes(s) ||
      d.rol?.toLowerCase().includes(s)
    );
  });

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
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, color: "text.primary", mb: 4 }}
      >
        Eliminar Docente
      </Typography>

      <Box maxWidth="400px" mx="auto" mb={4}>
        <TextField
          fullWidth
          label="Buscar por nombre, cédula o rol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {filtered.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No se encontraron docentes
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filtered.map((docente) => (
            <Grid item key={docente.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  
                  {/* Ícono de persona en azul */}
                  <PersonIcon
                    sx={{
                      fontSize: 50,
                      color: "#1976d2",
                      mb: 1,
                    }}
                  />

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {docente.nombre}
                  </Typography>

                  <Typography sx={{ mb: 1 }}>
                    <strong>Cédula:</strong> {docente.cedula || "—"}
                  </Typography>

                  <Typography sx={{ mb: 2 }}>
                    <strong>Rol:</strong> {docente.rol || "Docente"}
                  </Typography>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    onClick={() => handleDeleteClick(docente)}
                    sx={{ boxShadow: 2 }}
                  >
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Eliminar Docente</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar a{" "}
            <strong>{selectedDocente?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
