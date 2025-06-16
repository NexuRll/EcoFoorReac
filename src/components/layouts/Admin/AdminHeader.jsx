import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminHeader = ({ sidebarCollapsed, onToggleSidebar }) => {
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
    <header className="admin-header">
      <div className="header-content">
        {/* Lado izquierdo - Toggle y breadcrumb */}
        <div className="header-left">
          <button
            className="btn btn-link sidebar-toggle-btn d-md-none"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <div className="breadcrumb-section">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <i className="fas fa-shield-alt me-1"></i>
                  Administración
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Panel de Control
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Centro - Información del sistema */}
        <div className="header-center d-none d-lg-block">
          <div className="system-info">
            <div className="d-flex align-items-center">
              <div className="status-indicator online me-2"></div>
              <small className="text-muted">Sistema operativo</small>
            </div>
          </div>
        </div>

        {/* Lado derecho - Notificaciones y usuario */}
        <div className="header-right">
          {/* Notificaciones */}
          <div className="notification-section me-3">
            <button className="btn btn-link notification-btn" title="Notificaciones">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
          </div>

          {/* Información del usuario */}
          <div className="user-section">
            <div className="user-info d-none d-sm-block me-3">
              <div className="text-end">
                <div className="user-greeting">
                  {getGreeting()}, <strong>{usuario?.nombre || 'Administrador'}</strong>
                </div>
                <small className="text-muted">
                  <i className="fas fa-crown me-1"></i>
                  {usuario?.rol || 'Administrador'}
                </small>
              </div>
            </div>

            {/* Avatar y menú */}
            <div className="user-menu-container">
              <button
                className="btn btn-link user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Menú de usuario"
              >
                <div className="user-avatar">
                  <i className="fas fa-user-shield"></i>
                </div>
                <i className="fas fa-chevron-down ms-1"></i>
              </button>

              {/* Dropdown del usuario */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      <i className="fas fa-user-shield"></i>
                    </div>
                    <div className="user-details">
                      <strong>{usuario?.nombre || 'Administrador'}</strong>
                      <small className="text-muted d-block">{usuario?.email}</small>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={() => navigate('/admin/perfil')}>
                    <i className="fas fa-user me-2"></i>
                    Mi Perfil
                  </button>
                  
                  <button className="dropdown-item" onClick={() => navigate('/admin/configuracion')}>
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

      {/* Estilos CSS integrados */}
      <style>{`
        .admin-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 0.75rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 100%;
        }

        .header-left {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .sidebar-toggle-btn {
          color: #6c757d !important;
          padding: 0.375rem 0.75rem;
          margin-right: 1rem;
        }

        .sidebar-toggle-btn:hover {
          color: #495057 !important;
        }

        .breadcrumb {
          background: none;
          padding: 0;
          margin: 0;
        }

        .breadcrumb-item {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .breadcrumb-item.active {
          color: #495057;
          font-weight: 500;
        }

        .header-center {
          flex: 0 0 auto;
        }

        .system-info {
          text-align: center;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-indicator.online {
          background-color: #28a745;
          box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
        }

        .header-right {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
        }

        .notification-btn {
          color: #6c757d !important;
          padding: 0.5rem;
          position: relative;
        }

        .notification-btn:hover {
          color: #495057 !important;
        }

        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-info {
          text-align: right;
        }

        .user-greeting {
          font-size: 0.875rem;
          color: #495057;
        }

        .user-menu-container {
          position: relative;
        }

        .user-avatar-btn {
          color: #6c757d !important;
          padding: 0.25rem 0.5rem;
          display: flex;
          align-items: center;
        }

        .user-avatar-btn:hover {
          color: #495057 !important;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 0.375rem;
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
          min-width: 250px;
          z-index: 1000;
          margin-top: 0.25rem;
        }

        .dropdown-header {
          padding: 1rem;
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 0.375rem 0.375rem 0 0;
        }

        .user-avatar-large {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 0.75rem;
        }

        .user-details {
          flex: 1;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          text-align: left;
          color: #495057;
          text-decoration: none;
          transition: background-color 0.15s ease-in-out;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .dropdown-item.text-danger:hover {
          background-color: #f8d7da;
          color: #721c24;
        }

        .dropdown-divider {
          height: 0;
          margin: 0.5rem 0;
          overflow: hidden;
          border-top: 1px solid #e9ecef;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-header {
            padding: 0.5rem 1rem;
          }
          
          .header-content {
            flex-wrap: wrap;
          }
          
          .user-dropdown {
            right: -50px;
            min-width: 200px;
          }
        }
      `}</style>

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

export default AdminHeader; 