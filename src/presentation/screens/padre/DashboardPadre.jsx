// src/presentation/padre/DashboardPadre.jsx
import { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useLocation } from "react-router-dom";

import PadreInicioTab from "./PadreInicioTab";
import PadreAsignaturasTab from "./PadreAdminTab";
import PadrePerfilTab from "./PadrePerfilTab";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DashboardPadre() {
  const location = useLocation();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTab(location.state.tab);
    }
  }, [location]);

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
        <PadreInicioTab />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <PadreAsignaturasTab />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <PadrePerfilTab />
      </TabPanel>
    </Box>
  );
}
