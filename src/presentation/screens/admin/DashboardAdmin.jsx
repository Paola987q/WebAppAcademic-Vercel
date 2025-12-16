import { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useLocation } from "react-router-dom";

import InicioTab from "./InicioTab";
import AdministracionTab from "./AdministracionTab";
import PerfilTab from "./PerfilTab";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DashboardAdmin() {
  const location = useLocation();

  // Inicialmente selecciona la pestaña según location.state.tab o 0 (Inicio)
  const [tab, setTab] = useState(location.state?.tab || 0);

  const handleChange = (event, newValue) => setTab(newValue);

  // Actualiza tab si location.state.tab cambia (por ejemplo, al regresar desde un formulario)
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

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
        <Tab label="Administración" />
        <Tab label="Perfil" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <InicioTab />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AdministracionTab />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <PerfilTab />
      </TabPanel>
    </Box>
  );
}
