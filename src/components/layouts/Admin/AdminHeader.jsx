import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminHeader = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard'
    },
    {
      path: '/admin/clientes',
      icon: 'fas fa-users',
      label: 'Usuarios'
    },
    {
      path: '/admin/empresas',
      icon: 'fas fa-building',
      label: 'Empresas'
    },
    {
      path: '/admin/administradores',
      icon: 'fas fa-user-shield',
      label: 'Administradores'
    }
  ];

  return (
    <>
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
              <small style={{ opacity: 0.8 }}>Panel Admin</small>
            </div>
          </div>

          {/* Toggle button para móvil */}
          <button 
            className="navbar-toggler text-white" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#adminNavbar"
            style={{ border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Menú de navegación */}
          <div className="collapse navbar-collapse" id="adminNavbar">
            <ul className="navbar-nav me-auto">
              {menuItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link text-white d-flex align-items-center px-3 py-2 mx-1 rounded ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                    style={{
                      transition: 'all 0.3s ease',
                      background: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent'
                    }}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Usuario y menú */}
            <div className="d-flex align-items-center">
              {/* Avatar y dropdown */}
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
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <span className="ms-2 d-none d-md-inline">{userData?.Nombre || userData?.nombre || 'Admin'}</span>
                  <i className="fas fa-chevron-down ms-2"></i>
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
                      Mi Perfil
                    </button>
                    
                    <button className="dropdown-item" onClick={() => navigate('/admin/dashboard')}>
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Dashboard
                    </button>

                    <button className="dropdown-item" onClick={() => navigate('/admin/administradores')}>
                      <i className="fas fa-cog me-2"></i>
                      Configuración
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

      {/* Estilos adicionales */}
      <style>{`
        .navbar {
          min-height: 70px;
          padding: 0.75rem 1rem;
        }
        
        .navbar-brand {
          margin-right: 2rem;
        }
        
        .nav-link {
          white-space: nowrap;
          font-weight: 500;
        }
        
        .nav-link:hover {
          background: rgba(255,255,255,0.15) !important;
          transform: translateY(-1px);
        }
        
        .nav-link.active {
          background: rgba(255,255,255,0.25) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-weight: 600;
        }

        @media (max-width: 991px) {
          .navbar-nav {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          
          .nav-link {
            margin: 0.25rem 0;
            padding: 0.75rem 1rem;
          }
        }
        
        @media (min-width: 992px) {
          .navbar-nav .nav-item {
            margin: 0 0.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default AdminHeader;