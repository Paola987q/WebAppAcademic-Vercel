import { useNavigate } from "react-router-dom";
import logo from "../assets/icon_uefo.jpeg"; // ajusta la ruta si está en otra carpeta

function RolSelection() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#ffffff",
        color: "#000",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Logo institucional */}
      <div style={{ textAlign: "center", marginBottom: "0.3rem" }}>
        <img
          src={logo}
          alt="Logo institucional"
          style={{
            width: "90px",
            height: "90px",
            marginBottom: "0.3rem",
          }}
        />
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            margin: 0,
            color: "#222",
          }}
        >
          UNIDAD EDUCATIVA FRANCISCO DE ORELLANA
        </h2>
      </div>

      {/* Título principal */}
      <h1
        style={{
          fontSize: "2rem",
          marginTop: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        Selecciona tu rol
      </h1>

      {/* Botones de rol */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          width: "100%",
          maxWidth: "320px",
        }}
      >
        <button
          onClick={() => navigate("/login/admin")}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "1rem",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#0069d9";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#007bff";
            e.target.style.transform = "scale(1)";
          }}
        >
          🧑‍💼 Administrador
        </button>

        <button
          onClick={() => navigate("/login/docente")}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "1rem",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#218838";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#28a745";
            e.target.style.transform = "scale(1)";
          }}
        >
          👩‍🏫 Docente
        </button>

        <button
          onClick={() => navigate("/login/padre")}
          style={{
            backgroundColor: "#ffc107",
            color: "#333",
            padding: "1rem",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#e0a800";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#ffc107";
            e.target.style.transform = "scale(1)";
          }}
        >
          👨‍👩‍👧 Padre
        </button>
      </div>
    </div>
  );
}

export default RolSelection;
