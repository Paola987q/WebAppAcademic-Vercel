// src/presentation/screens/admin/AdministracionTab.jsx
import { Grid, Typography, Card, CardContent, Box } from "@mui/material";
import { 
  PersonAdd, 
  Edit, 
  PersonRemoveAlt1, 
  Person, 
  Class, 
  ListAlt, 
  LibraryBooks, 
  Delete 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function AdministracionTab() {
  return (
    <Box sx={{ p: 4, bgcolor: "#f0f2f5" }}>
      <Grid container spacing={6} sx={{ justifyContent: "center" }}>

        {/* --- ESTUDIANTES --- */}
        <Section title="Estudiantes">
          <AdminButton
            icon={<PersonAdd sx={{ fontSize: 40 }} />}
            label="Agregar Estudiante"
            color="#81c784"
            to="/admin/agregarest"       // ✔ corregido: minúsculas
            fallback="/admin/dashboard"
          />

          <AdminButton
            icon={<Edit sx={{ fontSize: 40 }} />}
            label="Editar Estudiante"
            color="#64b5f6"
            to="/admin/listest"          // ✔ corregido: minúsculas
            fallback="/admin/dashboard"
          />

          <AdminButton
            icon={<PersonRemoveAlt1 sx={{ fontSize: 40 }} />}
            label="Eliminar Estudiante"
            color="#e57373"
            to="/admin/eliminarest"      // ✔ corregido: minúsculas
            fallback="/admin/dashboard"
          />
        </Section>

        {/* --- DOCENTES --- */}
        <Section title="Docentes">
          <AdminButton
            icon={<Person sx={{ fontSize: 40 }} />}
            label="Agregar Docente"
            color="#81c784"
            to="/admin/agregardocente"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<Edit sx={{ fontSize: 40 }} />}
            label="Editar Docente"
            color="#64b5f6"
            to="/admin/listdocent"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<PersonRemoveAlt1 sx={{ fontSize: 40 }} />}
            label="Eliminar Docente"
            color="#e57373"
            to= "/admin/eliminardocent"
            fallback= "/admin/dashboard"
          />
        </Section>

        {/* --- CURSOS --- */}
        <Section title="Cursos">
          <AdminButton
            icon={<Class sx={{ fontSize: 40 }} />}
            label="Agregar Curso"
            color="#ffb74d"
            to="/admin/agregarcursos"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<ListAlt sx={{ fontSize: 40 }} />}
            label="Gestionar Cursos"
            color="#64b5f6"
            to="/admin/listcursos"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<Delete sx={{ fontSize: 40 }} />}
            label="Eliminar Curso"
            color="#e57373"
            to= "/admin/eliminarcursos"
            fallback= "/admin/dashboard"
          />


        </Section>

        {/* --- ASIGNATURAS --- */}
        <Section title="Asignaturas">
          <AdminButton
            icon={<LibraryBooks sx={{ fontSize: 40 }} />}
            label="Agregar Asignatura"
            color="#81c784"
            to="/admin/agregarasignatura"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<Edit sx={{ fontSize: 40 }} />}
            label="Editar Asignatura"
            color="#64b5f6"
            to="/admin/listasignatura"
            fallback="/admin/dashboard"
          />
          <AdminButton
            icon={<Delete sx={{ fontSize: 40 }} />}
            label="Eliminar Asignatura"
            color="#e57373"
            to="/admin/eliminarasignatura"
          />
        </Section>
      </Grid>
    </Box>
  );
}

// --- COMPONENTE DE SECCIÓN ---
function Section({ title, children }) {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          mb: 2,
          pt: 2,
          borderBottom: "2px solid #ccc",
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {children}
      </Grid>
    </Box>
  );
}

// --- BOTÓN ADMIN CON NAVEGACIÓN AUTOMÁTICA ---
function AdminButton({ icon, label, color, to, fallback }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to, { state: { from: fallback || "/admin/dashboard" } });
    }
  };

  return (
    <Grid
      sx={{
        flex: "1 1 250px",
        maxWidth: 300,
        margin: 1,
      }}
    >
      <Card
        onClick={handleClick}
        sx={{
          bgcolor: color,
          color: "#fff",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 3,
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-8px)", boxShadow: 8 },
        }}
      >
        <CardContent>
          {icon}
          <Typography sx={{ fontWeight: "bold", fontSize: 16, mt: 1 }}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
