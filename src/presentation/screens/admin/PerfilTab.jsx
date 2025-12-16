import { Box, Typography, Button } from "@mui/material";
import { AccountCircle, Logout } from "@mui/icons-material";
import { useAuth } from "../../context/useAuth"; // <-- importamos el contexto

export default function PerfilTab() {
  const { user } = useAuth();  // <-- obtenemos el usuario actual
  const userName = user?.name || "Usuario"; // <-- nombre real o "Usuario" por defecto
  const userRole = user?.role || "Administrador"; // <-- rol real o default

  const handleLogout = () => {
    alert("Sesión cerrada.");
    window.location.href = "/";
  };

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
        sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: "bold", fontSize: 16 }}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );
}
