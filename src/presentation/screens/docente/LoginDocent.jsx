import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Button,
  Paper,
} from "@mui/material";

import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function LoginDocent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const docRef = doc(db, "Docentes", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("No se encontró docente con estas credenciales");
        setLoading(false);
        return;
      }

      const docenteData = docSnap.data();

      navigate("/docente/dashboard", {
        state: { userName: docenteData.nombre },
      });

    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }

    setLoading(false);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          padding: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          sx={{ mb: 3 }}
        >
          Login Docente
        </Typography>

        {/* Email */}
        <TextField
          fullWidth
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="primary" />
              </InputAdornment>
            ),
          }}
        />

        {/* Contraseña */}
        <TextField
          fullWidth
          label="Contraseña"
          value={password}
          type={showPass ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPass(!showPass)}>
                  {showPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Botón */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, py: 1.4, fontSize: "16px" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </Button>
      </Paper>
    </Box>
  );
}
