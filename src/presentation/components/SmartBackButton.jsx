// src/components/SmartBackButton.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SmartBackButton({ fallback = "/" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // 1️⃣ Intentar volver a la ruta de origen
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }

    // 2️⃣ Intentar retroceder en el historial
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }

    // 3️⃣ Fallback seguro
    navigate(fallback);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={handleBack}
      sx={{ mb: 2 }}
    >
      Regresar
    </Button>
  );
}
