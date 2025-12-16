// src/presentation/screens/admin/AgregarEst.jsx
import { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { auth, db } from "../../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { useNavigate } from "react-router-dom";

export default function AgregarEst() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [paraleloSeleccionado, setParaleloSeleccionado] = useState("");
  const [cursos, setCursos] = useState([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [asignaturasFiltradas, setAsignaturasFiltradas] = useState([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Autocomplete de padre
  const [nombrePadreInput, setNombrePadreInput] = useState("");
  const [cedulaPadreInput, setCedulaPadreInput] = useState("");
  const [padresEncontrados, setPadresEncontrados] = useState([]);
  const [padreSeleccionado, setPadreSeleccionado] = useState(null);
  const searchTimeout = useRef(null);

  const navigate = useNavigate();
  const fallback = "/admin/dashboard";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cursosSnap = await getDocs(collection(db, "Cursos"));
        setCursos(cursosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const asigSnap = await getDocs(collection(db, "Asignaturas"));
        setAsignaturasDisponibles(asigSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        setLoading(false);
      } catch (error) {
        alert("Error cargando cursos o asignaturas");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!gradoSeleccionado) {
      setAsignaturasFiltradas([]);
      setAsignaturasSeleccionadas([]);
      setParaleloSeleccionado("");
      return;
    }

    const asignIds = [
      ...new Set(
        cursos.filter((c) => c.grado === gradoSeleccionado).map((c) => c.asignaturaId)
      ),
    ];

    setAsignaturasFiltradas(
      asignaturasDisponibles.filter((a) => asignIds.includes(a.id))
    );
    setAsignaturasSeleccionadas([]);
    setParaleloSeleccionado("");
  }, [gradoSeleccionado, cursos, asignaturasDisponibles]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (nombrePadreInput.trim().length < 2) {
      setPadresEncontrados([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      buscarPadres(nombrePadreInput.trim());
    }, 400);
  }, [nombrePadreInput]);

  async function buscarPadres(text) {
    try {
      const ref = collection(db, "Padres");
      const q = query(ref, where("nombre", ">=", text), where("nombre", "<=", text + "\uf8ff"));
      const snap = await getDocs(q);
      setPadresEncontrados(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      alert("Error buscando padres");
    }
  }

  function seleccionarPadre(p) {
    setPadreSeleccionado(p);
    setNombrePadreInput(p.nombre);
    setCedulaPadreInput(p.cedula || "");
    setPadresEncontrados([]);
  }

  async function crearNuevoPadre() {
    if (!nombrePadreInput.trim() || !cedulaPadreInput.trim()) {
      alert("Nombre y cédula requeridos");
      return;
    }

    try {
      const ref = await addDoc(collection(db, "Padres"), {
        nombre: nombrePadreInput,
        cedula: cedulaPadreInput,
      });

      setPadreSeleccionado({ id: ref.id, nombre: nombrePadreInput, cedula: cedulaPadreInput });
      setPadresEncontrados([]);
      alert("Padre creado");
    } catch (e) {
      alert("Error creando el padre");
    }
  }

  async function handleAgregarEstudiante() {
    if (!nombre || !cedula || !email || !password) return alert("Completa los datos del estudiante");
    if (!gradoSeleccionado || !paraleloSeleccionado) return alert("Selecciona grado y paralelo");
    if (asignaturasSeleccionadas.length === 0) return alert("Selecciona asignaturas");
    if (!padreSeleccionado) return alert("Selecciona un padre");

    setSaving(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const curso = cursos.find(
        (c) => c.grado === gradoSeleccionado && c.paralelo === paraleloSeleccionado
      );

      const asignaturasFinal = asignaturasDisponibles
        .filter((a) => asignaturasSeleccionadas.includes(a.id))
        .map((a) => ({ id: a.id, nombre: a.nombre }));

      await setDoc(doc(db, "Estudiantes", uid), {
        nombre,
        cedula,
        email,
        uid,
        grado: gradoSeleccionado,
        paralelo: paraleloSeleccionado,
        cursoId: curso?.id || "",
        asignaturas: asignaturasFinal,
        idPadre: padreSeleccionado.id,
      });

      alert("Estudiante registrado");
      navigate(fallback, { state: { tab: 1 } });

    } catch (error) {
      alert(error.message);
    }

    setSaving(false);
  }

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        background: "#f5f7fa",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 1100,
          p: isMobile ? 2 : 4,
          mx: "auto",
        }}
      >
        <Button
          onClick={() => navigate(fallback, { state: { tab: 1 } })}
          sx={{ mb: 3 }}
        >
          ← Regresar
        </Button>

        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          mb={3}
          textAlign="center"
        >
          Agregar Estudiante
        </Typography>

        <Stack spacing={2}>
          {/* Datos personales con íconos */}
          <TextField
            fullWidth
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Grado y paralelo */}
          <TextField
            select
            fullWidth
            label="Selecciona grado"
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon color="primary" />
                </InputAdornment>
              ),
            }}
          >
            {[...new Set(cursos.map((c) => c.grado))].sort().map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </TextField>

          {gradoSeleccionado && (
            <TextField
              select
              fullWidth
              label="Selecciona paralelo"
              value={paraleloSeleccionado}
              onChange={(e) => setParaleloSeleccionado(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {[...new Set(cursos.filter((c) => c.grado === gradoSeleccionado).map((c) => c.paralelo))].sort().map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          )}

          {/* Asignaturas */}
          {gradoSeleccionado && (
            <>
              <Typography fontWeight="bold">Asignaturas:</Typography>
              {asignaturasFiltradas.length === 0 ? (
                <Typography color="gray">No hay asignaturas disponibles</Typography>
              ) : (
                asignaturasFiltradas.map((a) => (
                  <Button
                    key={a.id}
                    fullWidth
                    variant={asignaturasSeleccionadas.includes(a.id) ? "contained" : "outlined"}
                    startIcon={asignaturasSeleccionadas.includes(a.id) ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                    onClick={() => setAsignaturasSeleccionadas(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                  >
                    {a.nombre}
                  </Button>
                ))
              )}
            </>
          )}

          {/* Padre */}
          <Typography fontWeight="bold" mt={2}>Datos del Padre</Typography>
          <TextField
            fullWidth
            label="Nombre del padre"
            value={nombrePadreInput}
            onChange={(e) => { setPadreSeleccionado(null); setNombrePadreInput(e.target.value); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: !padreSeleccionado && (
                <InputAdornment position="end">
                  <IconButton onClick={() => buscarPadres(nombrePadreInput)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Cédula del padre"
            value={cedulaPadreInput}
            onChange={(e) => setCedulaPadreInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {padresEncontrados.length > 0 && !padreSeleccionado && (
            <Paper sx={{ p: 1 }}>
              {padresEncontrados.map((p) => (
                <Box key={p.id} sx={{ p: 1, cursor: "pointer" }} onClick={() => seleccionarPadre(p)}>
                  {p.nombre}
                </Box>
              ))}
            </Paper>
          )}

          {!padreSeleccionado && (
            <Button variant="contained" fullWidth onClick={crearNuevoPadre}>
              Crear padre
            </Button>
          )}

          {padreSeleccionado && (
            <>
              <Typography color="green">Padre seleccionado: {padreSeleccionado.nombre}</Typography>
              <Button onClick={() => setPadreSeleccionado(null)}>Cambiar padre</Button>
            </>
          )}

          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleAgregarEstudiante} disabled={saving}>
            {saving ? "Registrando..." : "Registrar Estudiante"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
