// src/presentation/padre/TareasEstudiante.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebaseConfig';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TareasEst() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nombre de asignatura desde el state de navegación
  const asignaturaSeleccionada = location.state?.nombre || '';

  const [loading, setLoading] = useState(true);
  const [tareasConEstado, setTareasConEstado] = useState([]);
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser.uid;

        // Obtener info del estudiante
        const estudianteSnap = await getDoc(doc(db, 'Estudiantes', uid));
        if (!estudianteSnap.exists()) {
          setTareasConEstado([]);
          setLoading(false);
          return;
        }

        const cursoId = estudianteSnap.data()?.cursoId;
        if (!cursoId) {
          setTareasConEstado([]);
          setLoading(false);
          return;
        }

        // Obtener todas las tareas del curso
        const tareasSnap = await getDocs(collection(db, 'Cursos', cursoId, 'Tareas'));
        const tareasList = [];

        for (const tareaDoc of tareasSnap.docs) {
          const tareaData = tareaDoc.data();

          // Normalizar comparación de nombres de asignatura
          const nombreTarea = (tareaData.asignaturaNombre || '').trim().toLowerCase();
          const nombreSeleccionadoNorm = asignaturaSeleccionada.trim().toLowerCase();

          if (nombreTarea !== nombreSeleccionadoNorm) {
            // No es de la asignatura que queremos, saltar
            continue;
          }

          // Obtener estado del estudiante para esta tarea
          const estadoSnap = await getDoc(
            doc(db, 'Cursos', cursoId, 'Tareas', tareaDoc.id, 'Estados', uid)
          );
          const estadoData = estadoSnap.exists() ? estadoSnap.data() : { cumplio: null, nota: '' };

          tareasList.push({
            id: tareaDoc.id,
            titulo: tareaData.titulo,
            descripcion: tareaData.descripcion,
            fechaEntrega: tareaData.fechaEntrega,
            estado: estadoData,
          });
        }

        setTareasConEstado(tareasList);
      } catch (err) {
        console.error('Error al obtener tareas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTareas();
  }, [asignaturaSeleccionada]);

  // Función para filtrar tareas según estado
  const filtrarTareas = () => {
    if (filter === 'Todas') return tareasConEstado;
    if (filter === 'Cumplidas') return tareasConEstado.filter(t => t.estado.cumplio === true);
    if (filter === 'No Cumplidas') return tareasConEstado.filter(t => t.estado.cumplio === false);
    if (filter === 'Pendientes') return tareasConEstado.filter(t => t.estado.cumplio === null);
    return tareasConEstado;
  };

  const tareasFiltradas = filtrarTareas();

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
        <CircularProgress />
        <Typography mt={2}>Cargando tareas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigate('/padre/dashboard', { state: { tab: 1 }, replace: true })}
      >
        ← Regresar
      </Button>

      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
        Tareas de {asignaturaSeleccionada || 'la asignatura'}
      </Typography>

      {/* Filtro */}
      <ToggleButtonGroup
        color="primary"
        value={filter}
        exclusive
        onChange={(e, val) => val && setFilter(val)}
        sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}
      >
        {['Todas', 'Cumplidas', 'No Cumplidas', 'Pendientes'].map(item => (
          <ToggleButton key={item} value={item} sx={{ mx: 1, my: 0.5 }}>
            {item}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No hay tareas {filter !== 'Todas' ? `(${filter})` : ''}.
        </Typography>
      ) : (
        tareasFiltradas.map(tarea => (
          <Card key={tarea.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">{tarea.titulo}</Typography>
              <Typography sx={{ mb: 1 }}>{tarea.descripcion}</Typography>
              <Typography sx={{ mb: 1 }}>Entrega: {tarea.fechaEntrega}</Typography>
              <Typography sx={{ mb: 1 }}>
                Estado:{' '}
                {tarea.estado.cumplio === null
                  ? 'Pendiente'
                  : tarea.estado.cumplio
                  ? 'Cumplió'
                  : 'No cumplió'}
              </Typography>
              <Typography>Nota: {tarea.estado.nota !== '' ? tarea.estado.nota : '-'}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
