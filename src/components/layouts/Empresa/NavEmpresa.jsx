import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import CerrarSesion from "../../../context/CerrarSesion";
import { EMPRESA_ROUTES } from '../../../utils/constants/routes';
import { suscribirSolicitudesEmpresa } from '../../../services/productos/solicitudService';
import SolicitudesModal from '../../empresa/SolicitudesModal';

export default function NavEmpresa() {
  const { userData, currentUser } = useAuth();
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);

  // Suscribirse a cambios en las solicitudes para mostrar contador
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = suscribirSolicitudesEmpresa(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudesPendientes(solicitudesActualizadas);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const cantidadPendientes = solicitudesPendientes.length;
  
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container">
          <Link className="navbar-brand" to={EMPRESA_ROUTES.DASHBOARD}>
            <i className="fas fa-leaf me-2"></i>
            EcoFood
            <span className="ms-2 badge bg-light text-success">Panel Empresa</span>
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
            </ul>
            
            <div className="d-flex align-items-center">
              {/* Botón de Notificaciones */}
              <button 
                className="btn btn-outline-light position-relative me-3"
                onClick={() => setShowSolicitudes(true)}
                title="Solicitudes Pendientes"
              >
                <i className="fas fa-bell"></i>
                {cantidadPendientes > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cantidadPendientes}
                    <span className="visually-hidden">solicitudes pendientes</span>
                  </span>
                )}
              </button>

              {/* Información de la empresa */}
              <div className="dropdown">
                <button 
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  id="empresaDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="fas fa-building me-2"></i>
                  <div className="text-start d-none d-md-block">
                    <small className="text-light">Mi Empresa</small>
                    <br />
                    <span className="fw-bold">
                      {userData?.Nombre || userData?.nombre || 'Empresa'}
                    </span>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <h6 className="dropdown-header">
                      <i className="fas fa-building me-2"></i>
                      {userData?.Nombre || userData?.nombre || 'Empresa'}
                    </h6>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to={EMPRESA_ROUTES.PERFIL}>
                      <i className="fas fa-edit me-2"></i>
                      Editar Perfil
                    </Link>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setShowSolicitudes(true)}
                    >
                      <i className="fas fa-bell me-2"></i>
                      Ver Solicitudes
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <div className="px-3 py-2">
                      <CerrarSesion className="btn btn-danger btn-sm w-100" text="Cerrar Sesión" />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Solicitudes */}
      <SolicitudesModal 
        isOpen={showSolicitudes} 
        onClose={() => setShowSolicitudes(false)} 
      />
    </>
  );
} 