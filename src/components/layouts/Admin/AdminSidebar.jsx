import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      description: 'Panel principal'
    },
    {
      path: '/admin/clientes',
      icon: 'fas fa-users',
      label: 'Usuarios',
      description: 'Gestión de clientes'
    },
    {
      path: '/admin/empresas',
      icon: 'fas fa-building',
      label: 'Empresas',
      description: 'Gestión de empresas'
    },
    {
      path: '/admin/administradores',
      icon: 'fas fa-user-shield',
      label: 'Administradores',
      description: 'Configuración de admins'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center justify-content-between">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <i className="fas fa-leaf text-success me-2"></i>
              <span className="brand-text">EcoFood Admin</span>
            </div>
          )}
          <button
            className="btn btn-link sidebar-toggle"
            onClick={onToggle}
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <i className={`${item.icon} nav-icon`}></i>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <small className="nav-description">{item.description}</small>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="text-center text-muted">
            <small>
              <i className="fas fa-shield-alt me-1"></i>
              Panel de Administración
            </small>
          </div>
        </div>
      )}

      {/* Estilos CSS integrados */}
      <style>{`
        .admin-sidebar {
          width: 280px;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.3s ease;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .admin-sidebar.collapsed {
          width: 70px;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .sidebar-brand {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
        }

        .brand-text {
          background: linear-gradient(45deg, #fff, #e8f5e8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-toggle {
          color: white !important;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
          background-color: rgba(255,255,255,0.1);
          transform: scale(1.1);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: rgba(255,255,255,0.8) !important;
          text-decoration: none;
          transition: all 0.3s ease;
          border-radius: 0;
          margin: 0.125rem 0.5rem;
          border-radius: 0.5rem;
        }

        .nav-link:hover {
          background-color: rgba(255,255,255,0.1);
          color: white !important;
          transform: translateX(5px);
        }

        .nav-link.active {
          background-color: rgba(255,255,255,0.2);
          color: white !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .nav-icon {
          width: 20px;
          text-align: center;
          margin-right: 0.75rem;
          font-size: 1.1rem;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .nav-label {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-description {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.125rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin-top: auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          
          .admin-sidebar.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar; 