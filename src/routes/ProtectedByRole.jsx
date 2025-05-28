import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedByRole({ allowed, children }) {
  const { userData, loading } = useAuth();
  
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
  
  if (!userData || !allowed.includes(userData.tipo)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
