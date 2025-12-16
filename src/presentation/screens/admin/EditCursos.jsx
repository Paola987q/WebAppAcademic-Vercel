// src/presentation/screens/admin/EditCursos.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EditCursos() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos del curso
  const [selectedDocente, setSelectedDocente] = useState("");
  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedAsignatura, setSelectedAsignatura] = useState("");

  const [selectedParalelos, setSelectedParalelos] = useState({
    A: false,
    B: false,
    C: false,
  });

  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  const grados = [
    "1 inicial","2 inicial","3 inicial",
    "1ro básica","2do básica","3ro básica","4to básica","5to básica","6to básica",
    "7mo básica","8vo básica","9no básica","10mo básica",
    "1ro bachillerato","2do bachillerato","3ro bachillerato",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const docSnap = await getDocs(collection(db, "Docentes"));
        setDocentes(docSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const asigSnap = await getDocs(collection(db, "Asignaturas"));
        setAsignaturas(asigSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const cursoRef = doc(db, "Cursos", cursoId);
        const cursoSnap = await getDoc(cursoRef);

        if (!cursoSnap.exists()) {
          window.alert("El curso no existe");
          navigate(-1);
          return;
        }

        const cursoData = cursoSnap.data();
        setSelectedDocente(cursoData.docenteId || "");
        setSelectedGrado(cursoData.grado || "");
        setSelectedAsignatura(cursoData.asignaturaId || "");

        const paraleloOriginal = cursoData.paralelo;
        setSelectedParalelos({
          A: paraleloOriginal === "A",
          B: paraleloOriginal === "B",
          C: paraleloOriginal === "C",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error cargando EditCursos:", error);
        window.alert("Error al cargar datos del curso");
        setLoading(false);
      }
    };

    fetchData();
  }, [cursoId, navigate]);

  const toggleParalelo = (p) => {
    setSelectedParalelos((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const handleGuardar = async () => {
    if (!selectedDocente || !selectedGrado || !selectedAsignatura) {
      window.alert("Completa todos los campos");
      return;
    }

    const paralelosSeleccionados = Object.keys(selectedParalelos).filter(
      (k) => selectedParalelos[k]
    );
    if (paralelosSeleccionados.length === 0) {
      window.alert("Selecciona al menos un paralelo");
      return;
    }

    setSaving(true);

    try {
      const cursoRef = doc(db, "Cursos", cursoId);
      const cursoSnap = await getDoc(cursoRef);

      if (!cursoSnap.exists()) {
        window.alert("Curso original no encontrado");
        setSaving(false);
        return;
      }

      const originalParalelo = cursoSnap.data().paralelo;

      await updateDoc(cursoRef, {
        grado: selectedGrado,
        docenteId: selectedDocente,
        asignaturaId: selectedAsignatura,
        fechaModificacion: new Date(),
      });

      const paralelosAdicionales = paralelosSeleccionados.filter(
        (p) => p !== originalParalelo
      );

      const q = query(
        collection(db, "Cursos"),
        where("grado", "==", selectedGrado),
        where("asignaturaId", "==", selectedAsignatura),
        where("docenteId", "==", selectedDocente)
      );
      const snapshot = await getDocs(q);

      const existentes = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.paralelo && docSnap.id !== cursoId) {
          existentes[data.paralelo] = docSnap.id;
        }
      });

      for (const [paralelo, id] of Object.entries(existentes)) {
        if (!paralelosAdicionales.includes(paralelo)) {
          await deleteDoc(doc(db, "Cursos", id));
        }
      }

      for (const p of paralelosAdicionales) {
        if (!existentes[p]) {
          await addDoc(collection(db, "Cursos"), {
            grado: selectedGrado,
            docenteId: selectedDocente,
            asignaturaId: selectedAsignatura,
            paralelo: p,
            fechaCreacion: new Date(),
          });
        }
      }

      setSaving(false);
      navigate(-1);
    } catch (error) {
      console.error("Error guardando curso:", error);
      window.alert("Error al guardar cambios");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
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
          maxWidth: isMobile ? "100%" : 1200,
          margin: "0 auto",
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} textAlign="center" mb={3} fontWeight="bold">
          Editar Curso
        </Typography>

        <Grid container spacing={3} direction="column">
          {/* Grado */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Grado</InputLabel>
              <Select
                label="Grado"
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
              >
                <MenuItem value="">Selecciona un grado</MenuItem>
                {grados.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Docente */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Docente</InputLabel>
              <Select
                label="Docente"
                value={selectedDocente}
                onChange={(e) => setSelectedDocente(e.target.value)}
              >
                <MenuItem value="">Selecciona un docente</MenuItem>
                {docentes.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Asignatura */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Asignatura</InputLabel>
              <Select
                label="Asignatura"
                value={selectedAsignatura}
                onChange={(e) => setSelectedAsignatura(e.target.value)}
              >
                <MenuItem value="">Selecciona una asignatura</MenuItem>
                {asignaturas.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Paralelos */}
          <Grid item xs={12}>
            <Typography fontWeight="600" mb={1}>
              Paralelos
            </Typography>
            <FormGroup row>
              {["A", "B", "C"].map((p) => (
                <FormControlLabel
                  key={p}
                  control={
                    <Checkbox
                      checked={!!selectedParalelos[p]}
                      onChange={() => toggleParalelo(p)}
                      sx={{ color: "#007BFF" }}
                    />
                  }
                  label={p}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Guardar */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGuardar}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
