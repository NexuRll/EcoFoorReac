import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import CerrarSesion from "../../../context/CerrarSesion";

export default function NavAdmin() {
  const { userData } = useAuth();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/admin/dashboard">
          <i className="fas fa-leaf me-2"></i>
          EcoFood Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarAdmin"
          aria-controls="navbarAdmin"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarAdmin">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard">
                <i className="fas fa-tachometer-alt me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/empresas">
                <i className="fas fa-building me-1"></i> Empresas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/clientes">
                <i className="fas fa-users me-1"></i> Clientes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/administradores">
                <i className="fas fa-user-shield me-1"></i> Administradores
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <span className="text-light me-3">
              <i className="fas fa-user-shield me-1"></i> 
              {userData?.nombre || 'Administrador'}
            </span>
            <CerrarSesion className="btn btn-outline-danger btn-sm" text="Cerrar Sesión" />
          </div>
        </div>
      </div>
    </nav>
  );
} 