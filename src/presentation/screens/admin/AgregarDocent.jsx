// src/presentation/screens/admin/AgregarDocente.jsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
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

import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AgregarDocente() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const fallback = "/admin/dashboard";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAgregarDocente = async () => {
    if (!nombre || !cedula || !email || !password) {
      alert("Completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "Docentes", uid), {
        nombre,
        cedula,
        email,
        role: "docente",
        uid,
      });

      alert("Docente agregado correctamente");
      // Regreso inteligente a la pestaña Administración
      navigate(fallback, { state: { tab: 1 } });

    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

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
        {/* Botón de regreso */}
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
          Agregar Docente
        </Typography>

        {/* --- Campos verticales --- */}
        <Stack spacing={2}>
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
            label="Correo electrónico"
            type="email"
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

          <Button
            fullWidth
            variant="contained"
            sx={{ py: 1.5, mt: 1 }}
            onClick={handleAgregarDocente}
            disabled={loading}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : "Agregar Docente"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
