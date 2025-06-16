import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EmpresaHeader = () => {
  const { usuario, logout } = useAuth();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <header className="navbar navbar-expand-lg" style={{
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid">
        {/* Logo y marca */}
        <div className="navbar-brand text-white d-flex align-items-center">
          <div className="me-3" style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="fas fa-leaf"></i>
          </div>
          <div>
            <h5 className="mb-0">EcoFood</h5>
            <small style={{ opacity: 0.8 }}>Panel Empresa</small>
          </div>
        </div>

        {/* Centro - Información de la empresa */}
        <div className="d-none d-md-block text-center text-white">
          <div className="d-flex align-items-center justify-content-center">
            <div style={{
              width: '8px',
              height: '8px',
              background: '#fff',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <div>
              <div style={{ fontWeight: '600' }}>{usuario?.nombreEmpresa || 'Mi Empresa'}</div>
              <small style={{ opacity: 0.7 }}>Estado: Activo</small>
            </div>
          </div>
        </div>

        {/* Usuario */}
        <div className="d-flex align-items-center">
          <div className="text-white text-end me-3 d-none d-sm-block">
            <div style={{ fontSize: '0.875rem' }}>
              {getGreeting()}, <strong>{usuario?.nombre || 'Usuario'}</strong>
            </div>
            <small style={{ opacity: 0.7 }}>
              <i className="fas fa-building me-1"></i>
              Empresa
            </small>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-link text-white d-flex align-items-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: '35px',
                height: '35px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}>
                <i className="fas fa-user"></i>
              </div>
              <i className="fas fa-chevron-down"></i>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu dropdown-menu-end show" style={{
                minWidth: '280px',
                marginTop: '0.5rem'
              }}>
                <div className="dropdown-header bg-light">
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '45px',
                      height: '45px',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      marginRight: '12px'
                    }}>
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <strong>{usuario?.nombre || 'Usuario'}</strong>
                      <small className="text-muted d-block">{usuario?.email}</small>
                      <small className="text-success d-block">
                        <i className="fas fa-building me-1"></i>
                        {usuario?.nombreEmpresa || 'Mi Empresa'}
                      </small>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item" onClick={() => navigate('/empresa/perfil')}>
                  <i className="fas fa-user me-2"></i>
                  Mi Perfil
                </button>
                
                <button className="dropdown-item" onClick={() => navigate('/empresa/productos')}>
                  <i className="fas fa-box me-2"></i>
                  Mis Productos
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
  );
};

export default EmpresaHeader;