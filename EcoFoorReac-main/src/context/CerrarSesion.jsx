import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";

/**
 * Componente de botón para cerrar sesión
 * Funciona con cualquier tipo de usuario (normal, empresa, admin)
 */
export default function CerrarSesion({ className = "btn btn-danger", text = "Cerrar Sesión", icon = true }) {
  const navigate = useNavigate();
  const { logout, userType } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Usar la función logout del contexto de autenticación
      // Esta función ya maneja todos los tipos de usuarios
      await logout();
      
      Swal.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente",
        timer: 1500
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo cerrar la sesión: ${error.message || 'Error desconocido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Cerrando sesión...
        </>
      ) : (
        <>
          {icon && <i className="fas fa-sign-out-alt me-2"></i>}
          {text}
        </>
      )}
    </button>
  );
}