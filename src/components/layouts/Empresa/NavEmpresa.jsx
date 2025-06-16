import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import CerrarSesion from "../../../context/CerrarSesion";
import { EMPRESA_ROUTES } from '../../../utils/constants/routes';

export default function NavEmpresa() {
  const { userData } = useAuth();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to={EMPRESA_ROUTES.DASHBOARD}>
          <i className="fas fa-leaf me-2"></i>
          EcoFood Empresa
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarEmpresa"
          aria-controls="navbarEmpresa"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarEmpresa">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to={EMPRESA_ROUTES.DASHBOARD}>
                <i className="fas fa-tachometer-alt me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={EMPRESA_ROUTES.PERFIL}>
                <i className="fas fa-building me-1"></i> Mi Perfil
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={EMPRESA_ROUTES.PRODUCTOS}>
                <i className="fas fa-box me-1"></i> Mis Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/catalogo">
                <i className="fas fa-store me-1"></i> Ver Catálogo
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <span className="text-light me-3">
              <i className="fas fa-building me-1"></i> 
              {userData?.Nombre || userData?.nombre || 'Empresa'}
            </span>
            <CerrarSesion className="btn btn-outline-light btn-sm" text="Cerrar Sesión" />
          </div>
        </div>
      </div>
    </nav>
  );
} 