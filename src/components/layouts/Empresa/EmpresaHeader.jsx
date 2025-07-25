import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { suscribirSolicitudesEmpresa } from '../../../services/productos/solicitudService';
import SolicitudesModal from '../../empresa/SolicitudesModal';
import Swal from 'sweetalert2';

const EmpresaHeader = () => {
  const { userData, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);

  // Suscribirse a cambios en las solicitudes
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = suscribirSolicitudesEmpresa(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudesPendientes(solicitudesActualizadas);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const cantidadPendientes = solicitudesPendientes.length;

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await logout();
        navigate('/login');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cerrar la sesión'
        });
      }
    }
  };

  return (
    <>
      <header className="ecofood-header navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Logo EcoFood (izquierda) */}
          <div className="navbar-brand text-success d-flex align-items-center">
            <div className="brand-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold">EcoFood</h6>
            </div>
          </div>

          {/* Spacer para empujar el contenido a la derecha */}
          <div className="flex-grow-1"></div>

          {/* Notificaciones y Menú de usuario (derecha) */}
          <div className="d-flex align-items-center">
            {/* Botón de Notificaciones */}
            <button 
              className="btn btn-outline-success position-relative me-3"
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

            {/* Menú de usuario */}
            <div className="dropdown">
              <button
                className="btn btn-link text-dark d-flex align-items-center"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ textDecoration: 'none' }}
              >
                <span className="me-2 d-none d-md-inline">
                  {userData?.nombre || userData?.nombreEmpresa || 'Empresa'}
                </span>
                <div className="user-avatar">
                  <i className="fas fa-building"></i>
                </div>
              </button>

              {showUserMenu && (
                <div className="dropdown-menu dropdown-menu-end show" style={{
                  minWidth: '280px',
                  marginTop: '0.5rem'
                }}>
                  <div className="dropdown-header bg-light">
                    <div className="d-flex align-items-center">
                      <div className="user-avatar-large">
                        <i className="fas fa-building"></i>
                      </div>
                      <div>
                        <strong>{userData?.nombre || userData?.nombreEmpresa || 'Empresa'}</strong>
                        <small className="text-muted d-block">{userData?.email || userData?.correo || 'empresa@ecofood.com'}</small>
                        <small className="text-success d-block">
                          <i className="fas fa-building me-1"></i>
                          Empresa
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={() => navigate('/empresa/perfil')}>
                    <i className="fas fa-user me-2"></i>
                    Editar Perfil
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay para cerrar el menú */}
        {showUserMenu && (
          <div 
            className="position-fixed w-100 h-100"
            style={{ top: 0, left: 0, zIndex: 998 }}
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </header>

      {/* Modal de Solicitudes */}
      <SolicitudesModal 
        isOpen={showSolicitudes} 
        onClose={() => setShowSolicitudes(false)} 
      />
    </>
  );
};

export default EmpresaHeader;