import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminHeader = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

          {/* Spacer para empujar el menú de usuario a la derecha */}
          <div className="flex-grow-1"></div>

          {/* Menú de usuario (derecha) */}
          <div className="d-flex align-items-center">
            <div className="dropdown">
              <button
                className="btn btn-link text-dark d-flex align-items-center"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ textDecoration: 'none' }}
              >
                <span className="me-2 d-none d-md-inline">
                  {userData?.Nombre || userData?.nombre || 'Admin'}
                </span>
                <div className="user-avatar">
                  <i className="fas fa-user-shield"></i>
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
                        <i className="fas fa-user-shield"></i>
                      </div>
                      <div>
                        <strong>{userData?.Nombre || userData?.nombre || 'Administrador'}</strong>
                        <small className="text-muted d-block">{userData?.Correo || userData?.email || 'admin@ecofood.com'}</small>
                        <small className="text-success d-block">
                          <i className="fas fa-crown me-1"></i>
                          {userData?.esAdminPrincipal ? 'Admin Principal' : 'Administrador'}
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={() => navigate('/admin/perfil')}>
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
    </>
  );
};

export default AdminHeader;