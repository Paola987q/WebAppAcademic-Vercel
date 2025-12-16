import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  IconButton,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

import { useNavigate } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";

export default function ListDocent() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "Docentes"));
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDocentes(lista);
    } catch (error) {
      alert("No se pudo cargar la lista de docentes");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const handleEditar = (docente) => {
    navigate(`/admin/editdocent/${docente.id}`);
  };

  const filteredDocentes = docentes.filter(
    (d) =>
      d.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      d.cedula?.includes(search)
  );

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
          variant={isMobile ? "h5" : "h4"} // tamaño ajustado
          textAlign="center"
          mb={4}
          fontWeight="bold"
        >
          Lista de Docentes
        </Typography>

        {/* BUSCADOR */}
        <TextField
          label="Buscar por nombre o cédula"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size={isMobile ? "small" : "medium"}
          sx={{ mb: 3 }}
          InputProps={{
            style: { fontSize: isMobile ? 15 : 18 }, // ajustado
          }}
          InputLabelProps={{
            style: { fontSize: isMobile ? 14 : 17 }, // ajustado
          }}
        />

        {/* CONTENIDO */}
        {loading ? (
          <Grid container justifyContent="center" mt={5}>
            <CircularProgress />
          </Grid>
        ) : docentes.length === 0 ? (
          <Typography textAlign="center" mt={5} fontSize={18}>
            No hay docentes registrados.
          </Typography>
        ) : (
          filteredDocentes.map((doc) => (
            <Card
              key={doc.id}
              sx={{
                mt: 3,
                p: isMobile ? 1.5 : 3,
                borderRadius: 4,
                boxShadow: 4,
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                {/* ICONO PERSONA */}
                <Grid item xs={isMobile ? 12 : 3}>
                  <PersonIcon
                    color="primary"
                    sx={{
                      fontSize: isMobile ? 35 : 50, // ajustado
                      display: "block",
                      margin: isMobile ? "0 auto" : "0",
                    }}
                  />
                </Grid>

                {/* INFO */}
                <Grid item xs={isMobile ? 12 : 7} sx={{ mt: isMobile ? 1 : 0 }}>
                  <Typography
                    variant={isMobile ? "h6" : "h6"} // ajustado
                    fontWeight="bold"
                  >
                    {doc.nombre || "Sin nombre"}
                  </Typography>
                  <Typography fontSize={isMobile ? 13 : 15}> {/* ajustado */}
                    Cédula: {doc.cedula || "No definida"}
                  </Typography>
                  <Typography fontSize={isMobile ? 13 : 15}> {/* ajustado */}
                    Email: {doc.email || "No definido"}
                  </Typography>
                </Grid>

                {/* ICONO EDITAR */}
                <Grid
                  item
                  xs={isMobile ? 12 : 2}
                  sx={{
                    mt: isMobile ? 1 : 0,
                    display: "flex",
                    justifyContent: isMobile ? "center" : "flex-end",
                  }}
                >
                  <Box sx={{ ml: isMobile ? 0 : 80 }}>
                    <IconButton
                      onClick={() => handleEditar(doc)}
                      sx={{
                        p: isMobile ? 1.5 : 2,
                        borderRadius: 3,
                      }}
                    >
                      <EditIcon
                        color="primary"
                        sx={{ fontSize: isMobile ? 28 : 38 }} // ajustado
                      />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))
        )}
      </Grid>
    </Grid>
  );
}
