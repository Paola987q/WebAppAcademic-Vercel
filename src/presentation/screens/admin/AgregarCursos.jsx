// src/presentation/screens/admin/AgregarCurso.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

export default function AgregarCursos({ navigate }) {
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedDocente, setSelectedDocente] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedParalelos, setSelectedParalelos] = useState({ A: false, B: false, C: false });
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const azulIcono = '#007BFF';

  const grados = [
    '1 inicial', '2 inicial', '3 inicial',
    '1ro básica','2do básica','3ro básica','4to básica','5to básica','6to básica',
    '7mo básica','8vo básica','9no básica','10mo básica',
    '1ro bachillerato','2do bachillerato','3ro bachillerato'
  ];

  // Carga inicial: docentes y asignaturas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docentesSnapshot = await getDocs(collection(db, 'Docentes'));
        setDocentes(docentesSnapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));

        const asignaturasSnapshot = await getDocs(collection(db, 'Asignaturas'));
        setAsignaturas(asignaturasSnapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));

        setLoading(false);
      } catch (error) {
        alert('Error al cargar los datos');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleParalelo = (paralelo) => {
    setSelectedParalelos(prev => ({ ...prev, [paralelo]: !prev[paralelo] }));
  };

  const handleGuardarCurso = async () => {
    if (!selectedDocente || !selectedGrado || !selectedAsignatura) {
      alert('Por favor completa todos los campos');
      return;
    }

    const paralelosSeleccionados = Object.keys(selectedParalelos).filter(p => selectedParalelos[p]);
    if (paralelosSeleccionados.length === 0) {
      alert('Selecciona al menos un paralelo');
      return;
    }

    setSaving(true);

    let creados = 0;
    let yaExistian = 0;
    let errores = 0;

    for (const paralelo of paralelosSeleccionados) {
      try {
        // Verificar si ya existe un curso con mismo grado, docente, asignatura y paralelo
        const q = query(
          collection(db, "Cursos"),
          where("grado", "==", selectedGrado),
          where("docenteId", "==", selectedDocente),
          where("asignaturaId", "==", selectedAsignatura),
          where("paralelo", "==", paralelo)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          yaExistian++;
          continue; // saltar creación si ya existe
        }

        await addDoc(collection(db, 'Cursos'), {
          docenteId: selectedDocente,
          grado: selectedGrado,
          paralelo,
          asignaturaId: selectedAsignatura,
          fechaCreacion: new Date(),
        });
        creados++;
      } catch (err) {
        console.error(`Error creando paralelo ${paralelo}:`, err);
        errores++;
      }
    }

    setSaving(false);

    // Mensaje final
    let mensaje = '';
    if (creados) mensaje += `Se registraron ${creados} curso(s) correctamente.\n`;
    if (yaExistian) mensaje += `${yaExistian} ya existían y no se duplicaron.\n`;
    if (errores) mensaje += `${errores} no se pudieron crear debido a un error.\n`;

    alert(mensaje);

    // Limpiar campos
    setSelectedDocente('');
    setSelectedGrado('');
    setSelectedAsignatura('');
    setSelectedParalelos({ A: false, B: false, C: false });

    // Opcional: si quieres volver automáticamente a la lista:
    // navigate(-1);
  };

  if (loading) return <CircularProgress sx={{ mt: 5, display: 'block', mx: 'auto' }} />;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1100,
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" align="center" mb={4} fontWeight={600}>
        Registrar Curso
      </Typography>

      {/* Docente */}
      <TextField
        id="docente"
        name="docente"
        select
        label="Docente"
        fullWidth
        value={selectedDocente}
        onChange={e => setSelectedDocente(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: azulIcono }} />
            </InputAdornment>
          )
        }}
      >
        <MenuItem value="">Selecciona un docente</MenuItem>
        {docentes.map(d => (
          <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
        ))}
      </TextField>

      {/* Grado */}
      <TextField
        id="grado"
        name="grado"
        select
        label="Grado"
        fullWidth
        value={selectedGrado}
        onChange={e => setSelectedGrado(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SchoolIcon sx={{ color: azulIcono }} />
            </InputAdornment>
          )
        }}
      >
        <MenuItem value="">Selecciona un grado</MenuItem>
        {grados.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
      </TextField>

      {/* Paralelos */}
      <Typography variant="subtitle1" mt={2} mb={1}>Paralelos:</Typography>
      <FormGroup row sx={{ mb: 3 }}>
        {['A', 'B', 'C'].map(p => (
          <FormControlLabel
            key={p}
            control={
              <Checkbox
                id={`paralelo-${p}`} // ID único
                checked={selectedParalelos[p]}
                onChange={() => toggleParalelo(p)}
                sx={{ color: azulIcono }}
              />
            }
            label={p}
          />
        ))}
      </FormGroup>

      {/* Asignatura */}
      <TextField
        id="asignatura"
        name="asignatura"
        select
        label="Asignatura"
        fullWidth
        value={selectedAsignatura}
        onChange={e => setSelectedAsignatura(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MenuBookIcon sx={{ color: azulIcono }} />
            </InputAdornment>
          )
        }}
      >
        <MenuItem value="">Selecciona una asignatura</MenuItem>
        {asignaturas.map(a => (
          <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
        onClick={handleGuardarCurso}
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Registrar Curso'}
      </Button>
    </Box>
  );
}
