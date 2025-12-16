// src/presentation/screens/docente/DashboardDocent.jsx
import { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useLocation } from "react-router-dom";

// Importa tus pestañas
import DocentInicioTab from "./DocentInicioTab";
import DocentAdminTab from "./DocentAdminTab";
import DocentPerfilTab from "./DocentPerfilTab";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DashboardDocent() {
  const location = useLocation();

  // Estado de pestaña
  const [tab, setTab] = useState(0);

  // Escucha cambios de ubicación y actualiza pestaña
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTab(location.state.tab);
    }
  }, [location]); // <-- importante escuchar toda la ubicación

  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f7fa", minHeight: "100vh", pb: 5 }}>
      <Tabs
        value={tab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "#fff",
          "& .MuiTab-root": { fontWeight: "bold", fontSize: 16 },
        }}
      >
        <Tab label="Inicio" />
        <Tab label="Asignaturas" />
        <Tab label="Perfil" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <DocentInicioTab />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <DocentAdminTab />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <DocentPerfilTab />
      </TabPanel>
    </Box>
  );
}
