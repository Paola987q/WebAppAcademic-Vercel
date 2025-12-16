import React, { useContext } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AccountCircle, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PadrePerfilTab() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    alert("Sesión cerrada."); // opcional
    navigate("/"); // redirige a la pantalla principal
  };

  const userName = user?.nombre || "-"; // nombre del estudiante
  const userRole = "Estudiante"; // rol fijo

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <AccountCircle sx={{ fontSize: 100, color: "#007BFF", mb: 2 }} />

      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {userName}
      </Typography>

      <Typography sx={{ color: "#555", mb: 4 }}>
        Rol: {userRole}
      </Typography>

      <Button
        variant="contained"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.5,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );
}
