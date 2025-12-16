// src/presentation/screens/docente/DocentInicioTab.jsx
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from "../../context/useAuth.js"; // hook que lee AuthContext

// Importar imágenes
import uefo_imagen3 from "../../../assets/uefo_imagen3.jpg";
import uefo_imagen4 from "../../../assets/uefo_imagen4.jpg";
import uefo_imagen5 from "../../../assets/uefo_imagen5.jpg";

const images = [uefo_imagen3, uefo_imagen4, uefo_imagen5];

export default function DocentInicioTab() {
  const { user, loading } = useAuth();

  // Mientras se carga el usuario
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h5">Cargando...</Typography>
      </Box>
    );
  }

  const userName = user?.nombre || "Docente"; // nombre real del docente
  const userRole = user?.role || "Docente";

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box sx={{ mt: 3, px: 2 }}>
      {/* Nombre y rol del docente */}
      <Typography
        variant="h5"
        sx={{ textAlign: "center", fontWeight: "bold", color: "#333", mb: 3 }}
      >
        Bienvenido, {userName} 
      </Typography>

      {/* Visión */}
      <Typography variant="h6" sx={{ color: "#007BFF", fontWeight: "bold" }}>
        Visión
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Ser una institución educativa líder, comprometida con la formación integral de sus estudiantes.
      </Typography>

      {/* Misión */}
      <Typography variant="h6" sx={{ color: "#007BFF", fontWeight: "bold" }}>
        Misión
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Formar estudiantes con valores, conocimientos y habilidades para contribuir al desarrollo de la sociedad.
      </Typography>

      {/* Nuestra institución */}
      <Typography variant="h6" sx={{ color: "#007BFF", fontWeight: "bold" }}>
        Nuestra Institución
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Unidad Educativa Francisco de Orellana — fomentando la excelencia académica y humana.
      </Typography>

      {/* Carrusel de imágenes */}
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Slider {...sliderSettings}>
          {images.map((img, idx) => (
            <Box key={idx} sx={{ px: 1 }}>
              <Box
                component="img"
                src={img}
                alt={`Institución ${idx + 1}`}
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                }}
              />
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
}
