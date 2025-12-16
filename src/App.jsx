// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Contexto de autenticación
import { AuthProvider } from "./presentation/context/AuthContext";

// Pantallas principales
import RolSelection from "./presentation/RolSelection.jsx";
import AdminLoginScreen from "./presentation/AdminLoginScreen.jsx";

// ADMIN
import DashboardAdmin from "./presentation/screens/admin/DashboardAdmin.jsx";

// Estudiantes
import AgregarEst from "./presentation/screens/admin/AgregarEst.jsx";
import ListEst from "./presentation/screens/admin/ListEst.jsx";
import EditEst from "./presentation/screens/admin/EditEst.jsx";
import EliminarEst from "./presentation/screens/admin/EliminarEst.jsx";

// Docente
import AgregarDoc from "./presentation/screens/admin/AgregarDocent.jsx";
import ListDoc from "./presentation/screens/admin/ListDocent.jsx";
import EditDocent from "./presentation/screens/admin/EditDocent.jsx";
import EliminarDocent from "./presentation/screens/admin/EliminarDocent.jsx";

// Cursos
import AgregarCursos from "./presentation/screens/admin/AgregarCursos.jsx";
import ListCursos from "./presentation/screens/admin/ListCursos.jsx";
import EditCursos from "./presentation/screens/admin/EditCursos.jsx";
import EliminarCursos from "./presentation/screens/admin/EliminarCursos.jsx";

// Asignatura
import AgregarAsign from "./presentation/screens/admin/AgregarAsign.jsx";
import ListAsign from "./presentation/screens/admin/ListAsign.jsx";
import EditAsign from "./presentation/screens/admin/EditAsign.jsx";
import EliminarAsign from "./presentation/screens/admin/EliminarAsign.jsx";

// DOCENTE
import LoginDocent from "./presentation/screens/docente/LoginDocent.jsx";
import DashboardDocent from "./presentation/screens/docente/DashboardDocent.jsx";
import Asistencia from "./presentation/screens/docente/Asistencia.jsx";
import Calificaciones from "./presentation/screens/docente/Calificaciones.jsx";
import ReportCalificacion from "./presentation/screens/docente/ReportCalificacion.jsx";
import TasksOpciones from "./presentation/screens/docente/TasksOpciones.jsx";
import AgregarTarea from "./presentation/screens/docente/AgregarTarea.jsx";
import SelectionTarea from "./presentation/screens/docente/SelectionTarea.jsx";
import CalificarTarea from "./presentation/screens/docente/CalificarTarea.jsx";
import ListaTarea from "./presentation/screens/docente/ListaTarea.jsx";
import EditarTarea from "./presentation/screens/docente/EditarTarea.jsx";

//PADRE
import LoginFather from "./presentation/screens/padre/LoginFather.jsx";
import DashboardPadre from "./presentation/screens/padre/DashboardPadre.jsx";
import AsistenciaEst from "./presentation/screens/padre/AsistenciaEst.jsx";
import CalificacionesEst from "./presentation/screens/padre/CalificacionesEst.jsx";
import TareasEst from "./presentation/screens/padre/TareasEst.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Selección de rol */}
          <Route path="/" element={<RolSelection />} />

          {/* Login administrador */}
          <Route path="/login/admin" element={<AdminLoginScreen />} />

          {/* Dashboard administrador */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />

          {/* --- ESTUDIANTES --- */}
          <Route path="/admin/agregarest" element={<AgregarEst />} />
          <Route path="/admin/listest" element={<ListEst />} />
          <Route path="/admin/editest/:estudianteId" element={<EditEst />} />
          <Route path="/admin/eliminarest" element={<EliminarEst />} />

          {/* --- DOCENTE --- */}
          <Route path="/admin/agregardocente" element={<AgregarDoc />} />
          <Route path="/admin/listdocent" element={<ListDoc />} />
          <Route path="/admin/editdocent/:docenteId" element={<EditDocent />} />
          <Route path="/admin/eliminardocent" element={<EliminarDocent />} />

          {/* --- CURSOS --- */}
          <Route path="/admin/agregarcursos" element={<AgregarCursos />} />
          <Route path="/admin/listcursos" element={<ListCursos />} />
          <Route path="/admin/editcursos/:cursoId" element={<EditCursos />} />
          <Route path="/admin/eliminarcursos" element={<EliminarCursos />} />

          {/* --- ASIGNATURA --- */}
          <Route path="/admin/agregarasignatura" element={<AgregarAsign />} />
          <Route path="/admin/listasignatura" element={<ListAsign />} />
          <Route path="/admin/editasignatura/:asignaturaId" element={<EditAsign />} />
          <Route path="/admin/eliminarasignatura" element={<EliminarAsign />} />

          {/* LOGIN DOCENTE */}
          <Route path="/login/docente" element={<LoginDocent />} />
          <Route path="/docente/dashboard" element={<DashboardDocent />} />
          <Route path="/docente/asistencia" element={<Asistencia />} />
          <Route path="/docente/calificaciones" element={<Calificaciones />} />
          <Route path="/docente/reportecalificacion" element={<ReportCalificacion />} />
          <Route path="/docente/tareas-seleccion" element={<TasksOpciones />} />
          <Route path="/docente/crear-tarea" element={<AgregarTarea />} />
          <Route path="/docente/lista-tarea" element={<SelectionTarea />} />
          <Route path="/docente/calificar-tarea" element={<CalificarTarea />} />
          <Route path="/docente/seleccionar-tarea" element={<ListaTarea />} />
          <Route path="/docente/editar-tarea" element={<EditarTarea />} />

          {/* LOGIN PADRE */}
          <Route path="/login/padre" element={<LoginFather />} />   
          <Route path="/padre/dashboard" element={<DashboardPadre />} />  
          <Route path="/padre/asistencia" element={<AsistenciaEst />} /> 
          <Route path="/padre/calificaciones" element={<CalificacionesEst />} /> 
           <Route path="/padre/tareas" element={<TareasEst />} /> 

          {/* Ruta no encontrada */}
          <Route path="*" element={<RolSelection />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
