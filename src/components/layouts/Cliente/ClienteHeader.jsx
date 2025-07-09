import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { suscribirSolicitudesCliente, verificarYLimpiarSolicitudesAntiguas } from '../../../services/productos/solicitudService';
import CarritoModal from '../../cliente/CarritoModal';
import Swal from 'sweetalert2';

const ClienteHeader = () => {
  const { userData, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCarrito, setShowCarrito] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);

  // Suscribirse a cambios en las solicitudes para mostrar contador
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = suscribirSolicitudesCliente(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudes(solicitudesActualizadas);
    });

    // Ejecutar limpieza inicial
    verificarYLimpiarSolicitudesAntiguas(currentUser.uid).catch(error => {
      console.error('Error en limpieza inicial:', error);
    });

    // Configurar limpieza periódica cada 30 minutos
    const intervalId = setInterval(() => {
      verificarYLimpiarSolicitudesAntiguas(currentUser.uid).catch(error => {
        console.error('Error en limpieza periódica:', error);
      });
    }, 30 * 60 * 1000); // 30 minutos

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [currentUser]);

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

  const totalSolicitudes = solicitudes.length;

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

          {/* Carrito y Menú de usuario (derecha) */}
          <div className="d-flex align-items-center">
            {/* Botón del Carrito */}
            <button 
              className="btn btn-outline-success position-relative me-3"
              onClick={() => setShowCarrito(true)}
              title="Mi Carrito"
            >
              <i className="fas fa-shopping-cart"></i>
              {totalSolicitudes > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {totalSolicitudes}
                  <span className="visually-hidden">solicitudes en carrito</span>
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
                  {userData?.nombre?.split(' ')[0] || 'Cliente'}
                </span>
                <div className="user-avatar">
                  <i className="fas fa-user-circle"></i>
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
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div>
                        <strong>{userData?.nombre || 'Cliente'}</strong>
                        <small className="text-muted d-block">{userData?.email || userData?.correo || 'cliente@ecofood.com'}</small>
                        <small className="text-success d-block">
                          <i className="fas fa-user me-1"></i>
                          Cliente
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={() => navigate('/cliente/perfil')}>
                    <i className="fas fa-user-edit me-2"></i>
                    Editar Perfil
                  </button>
                  
                  <button 
                    className="dropdown-item" 
                    onClick={() => setShowCarrito(true)}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Mi Carrito
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

      {/* Modal del Carrito */}
      <CarritoModal 
        isOpen={showCarrito} 
        onClose={() => setShowCarrito(false)} 
      />
    </>
  );
};

export default ClienteHeader;