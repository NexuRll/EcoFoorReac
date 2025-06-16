import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedByRole({ allowed, children }) {
  const { userData, loading, userType } = useAuth();
  
  // Debug logs desactivados para producción
  // console.log('=== PROTECTED BY ROLE DEBUG ===');
  // console.log('allowed:', allowed);
  // console.log('userData:', userData);
  // console.log('userType:', userType);
  // console.log('userData?.tipo:', userData?.tipo);
  // console.log('loading:', loading);
  // console.log('Does userData exist?', !!userData);
  // console.log('Is tipo in allowed?', userData ? allowed.includes(userData.tipo) : 'no userData');
  // console.log('Is userType in allowed?', allowed.includes(userType));
  // console.log('==============================');
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="ms-3">Verificando permisos...</p>
      </div>
    );
  }
  
  // Verificar tanto userData.tipo como userType por compatibilidad
  const tipoUsuario = userData?.tipo || userType;
  
  if (!userData || !allowed.includes(tipoUsuario)) {
    // console.log('ACCESO DENEGADO - Redirigiendo al login');
    // console.log('Razón: userData existe?', !!userData, '| tipo válido?', allowed.includes(tipoUsuario));
    return <Navigate to="/login" replace />;
  }
  
  // console.log('ACCESO PERMITIDO - Renderizando children');
  return children;
}
