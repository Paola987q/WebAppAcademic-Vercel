// src/presentation/screens/admin/EditEst.jsx
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AccountCircle, Badge, Email } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";

import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function EditEst() {
  const { estudianteId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detecta celular

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");

  const [cursos, setCursos] = useState([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);

  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState("");
  const [asignaturasFiltradas, setAsignaturasFiltradas] = useState([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState([]);

  const [padres, setPadres] = useState([]);
  const [padreSeleccionado, setPadreSeleccionado] = useState(null);
  const [busquedaPadre, setBusquedaPadre] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ======================================
  // CARGA DE DATOS
  // ======================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cursos
        const cursosSnap = await getDocs(collection(db, "Cursos"));
        setCursos(cursosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Asignaturas
        const asignaturasSnap = await getDocs(collection(db, "Asignaturas"));
        setAsignaturasDisponibles(
          asignaturasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );

        // Padres
        const padresSnap = await getDocs(collection(db, "Padres"));
        const padresData = padresSnap.docs.map((p) => ({
          id: p.id,
          ...p.data(),
        }));
        setPadres(padresData);

        // Estudiante
        const estudianteDoc = await getDoc(doc(db, "Estudiantes", estudianteId));
        if (!estudianteDoc.exists()) {
          window.alert("Estudiante no encontrado");
          navigate(-1);
          return;
        }

        const data = estudianteDoc.data();

        setNombre(data.nombre);
        setCedula(data.cedula);
        setEmail(data.email);

        setGradoSeleccionado(data.grado);
        setParaleloSeleccionado(data.paralelo);

        setAsignaturasSeleccionadas(
          data.asignaturas?.map((a) => a.id) || []
        );

        if (data.idPadre) {
          const padre = padresData.find((p) => p.id === data.idPadre);
          setPadreSeleccionado(padre);
        }

        setLoading(false);
      } catch (e) {
        console.log(e);
        window.alert("Error cargando datos");
        setLoading(false);
      }
    };

    fetchData();
  }, [estudianteId, navigate]);

  // ======================================
  // LISTAS CALCULADAS
  // ======================================

  const gradosUnicos = [...new Set(cursos.map((c) => c.grado))];

  const paralelosPorGrado = gradoSeleccionado
    ? [
        ...new Set(
          cursos
            .filter((c) => c.grado === gradoSeleccionado)
            .map((c) => c.paralelo)
        ),
      ]
    : [];

  useEffect(() => {
    if (!gradoSeleccionado) return;

    const ids = [
      ...new Set(
        cursos
          .filter((c) => c.grado === gradoSeleccionado)
          .map((c) => c.asignaturaId)
      ),
    ];

    setAsignaturasFiltradas(
      asignaturasDisponibles.filter((a) => ids.includes(a.id))
    );
  }, [gradoSeleccionado, cursos, asignaturasDisponibles]);

  const padresFiltrados = padres.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaPadre.toLowerCase())
  );

  // ======================================
  // ACCIONES
  // ======================================

  const toggleAsignatura = (id) => {
    setAsignaturasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleActualizar = async () => {
    if (!nombre || !cedula || !email)
      return window.alert("Completa todos los campos");
    if (!gradoSeleccionado) return window.alert("Selecciona un grado");
    if (!paraleloSeleccionado) return window.alert("Selecciona un paralelo");
    if (asignaturasSeleccionadas.length === 0)
      return window.alert("Selecciona al menos una asignatura");
    if (!padreSeleccionado)
      return window.alert("Selecciona un padre");

    setSaving(true);

    try {
      const curso = cursos.find(
        (c) =>
          c.grado === gradoSeleccionado &&
          c.paralelo === paraleloSeleccionado
      );

      const asignFinal = asignaturasDisponibles
        .filter((a) => asignaturasSeleccionadas.includes(a.id))
        .map((a) => ({ id: a.id, nombre: a.nombre }));

      await updateDoc(doc(db, "Estudiantes", estudianteId), {
        nombre,
        cedula,
        email,
        grado: gradoSeleccionado,
        paralelo: paraleloSeleccionado,
        cursoId: curso?.id || "",
        asignaturas: asignFinal,
        idPadre: padreSeleccionado.id,
      });

      window.alert("Estudiante actualizado");
      navigate(-1);
    } catch (e) {
      window.alert("Error: " + e.message);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <CircularProgress />
      </div>
    );
  }

  // ======================================
  // RENDER
  // ======================================

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
          maxWidth: isMobile ? "100%" : "1000px",
          margin: "0 auto",
        }}
      >
        <Card sx={{ p: isMobile ? 2 : 4 }}>
          <CardContent>
            <Typography
              variant={isMobile ? "h5" : "h3"}
              textAlign="center"
              mb={4}
              fontWeight="bold"
            >
              Editar Estudiante
            </Typography>

            {/* Nombre */}
            <TextField
              label="Nombre completo"
              fullWidth
              margin="normal"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle sx={{ color: "#1976d2" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Cedula */}
            <TextField
              label="Cédula"
              fullWidth
              margin="normal"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: "#1976d2" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email */}
            <TextField
              label="Correo electrónico"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#1976d2" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Grado */}
            <Typography mt={2}>Selecciona Grado:</Typography>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: 10,
              }}
            >
              {gradosUnicos.map((g) => (
                <Chip
                  key={g}
                  label={g}
                  onClick={() => setGradoSeleccionado(g)}
                  color={gradoSeleccionado === g ? "primary" : "default"}
                />
              ))}
            </div>

            {/* Paralelo */}
            {gradoSeleccionado && (
              <>
                <Typography mt={3}>Selecciona Paralelo:</Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: 10,
                  }}
                >
                  {paralelosPorGrado.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      onClick={() => setParaleloSeleccionado(p)}
                      color={paraleloSeleccionado === p ? "primary" : "default"}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Asignaturas */}
            {gradoSeleccionado && (
              <>
                <Typography mt={3}>Selecciona Asignaturas:</Typography>
                {asignaturasFiltradas.map((asig) => (
                  <Chip
                    key={asig.id}
                    label={asig.nombre}
                    onClick={() => toggleAsignatura(asig.id)}
                    color={asignaturasSeleccionadas.includes(asig.id) ? "primary" : "default"}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </>
            )}

            {/* Buscador padres */}
            <Typography mt={3}>Selecciona Padre:</Typography>
            <TextField
              fullWidth
              placeholder="Buscar padre..."
              value={busquedaPadre}
              onChange={(e) => setBusquedaPadre(e.target.value)}
              sx={{ mt: 1 }}
            />
            <div
              style={{
                maxHeight: 150,
                overflowY: "auto",
                marginTop: 10,
              }}
            >
              {padresFiltrados.map((p) => (
                <Chip
                  key={p.id}
                  label={p.nombre}
                  onClick={() => setPadreSeleccionado(p)}
                  color={padreSeleccionado?.id === p.id ? "primary" : "default"}
                  sx={{ m: 0.5 }}
                />
              ))}
            </div>

            {/* Cedula del padre */}
            {padreSeleccionado && (
              <TextField
                fullWidth
                margin="normal"
                label="Cédula del padre"
                value={padreSeleccionado.cedula}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Botón */}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={saving}
              onClick={handleActualizar}
            >
              {saving ? "Actualizando..." : "Actualizar Estudiante"}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
