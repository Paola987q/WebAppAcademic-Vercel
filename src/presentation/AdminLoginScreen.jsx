// src/presentation/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { UserRepositorio } from "../data/repositorio/UserRepositorio";

const userRepo = new UserRepositorio();

export default function AdminLoginScreen() {
  const navigate = useNavigate();

  const [showSecurityScreen, setShowSecurityScreen] = useState(true);
  const [securityCodeInput, setSecurityCodeInput] = useState("");
  const SECURITY_CODE = "1234567";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validar código de seguridad
  const validateSecurityCode = () => {
    if (securityCodeInput === SECURITY_CODE) {
      setShowSecurityScreen(false);
      setSecurityCodeInput("");
    } else {
      alert("Código incorrecto");
      setSecurityCodeInput("");
    }
  };

  // Login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const user = await userRepo.loginUser(email, password);

      if (user.role?.toLowerCase() !== "administrador") {
        alert("No eres administrador");
        setLoading(false);
        return;
      }

      navigate("/admin/dashboard", { state: { userName: user.name } });
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
    setLoading(false);
  };

  // Pantalla de código de seguridad
  if (showSecurityScreen) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#fff", padding: 20 }}>
        <h1 style={{ color: "#050505ff", marginBottom: 20, fontSize: 28, fontWeight: "bold" }}>Código de Seguridad</h1>
        <p style={{ color: "#007BFF", marginBottom: 20 }}>Ingresa el código de 7 dígitos para acceder:</p>
        <input
          type="number"
          placeholder="Código de seguridad"
          value={securityCodeInput}
          onChange={(e) => { if (e.target.value.length <= 7) setSecurityCodeInput(e.target.value); }}
          style={{ padding: 12, fontSize: 16, borderRadius: 12, border: "1px solid #007BFF", outline: "none", textAlign: "center", marginBottom: 20, width: "100%", maxWidth: 350 }}
        />
        <button
          onClick={validateSecurityCode}
          style={{ padding: 12, width: "100%", maxWidth: 350, backgroundColor: "#007BFF", color: "#fff", fontWeight: "bold", border: "none", borderRadius: 12, cursor: "pointer", transition: "background 0.2s" }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0069d9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007BFF"}
        >
          Validar
        </button>
      </div>
    );
  }

  // Pantalla de login
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#fff", padding: 20 }}>
      <h1 style={{ color: "#060606ff", marginBottom: 30, fontSize: 28, fontWeight: "bold" }}>
        Login Administrador
      </h1>

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Correo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, padding: 12, borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", backgroundColor: "#fff" }}>
          <FaEnvelope color="#007BFF" style={{ marginRight: 10 }} />
          <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, border: "none", outline: "none", fontSize: 16 }} />
        </div>

        {/* Contraseña */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, padding: 12, borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", backgroundColor: "#fff" }}>
          <FaLock color="#007BFF" style={{ marginRight: 10 }} />
          <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ flex: 1, border: "none", outline: "none", fontSize: 16 }} />
          <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", marginLeft: 8 }}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: 12, backgroundColor: "#007BFF", color: "#fff", fontWeight: "bold", border: "none", borderRadius: 12, cursor: "pointer", transition: "background 0.2s" }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0069d9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007BFF"}
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </div>
    </div>
  );
}
