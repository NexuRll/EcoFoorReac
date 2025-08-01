import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

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
    <div className="ecofood-sidebar d-flex flex-column">
      {/* Logo/Brand del Sidebar */}
      <div className="sidebar-brand">
        <Link to="/admin/dashboard" className="text-white text-decoration-none">
          <div className="d-flex align-items-center">
            <div className="brand-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div>
              <h5 className="mb-0">EcoFood</h5>
              <small className="text-muted">Panel Admin</small>
            </div>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  isActive(item.path) ? 'active' : ''
                }`}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="sidebar-footer">
        <small className="text-muted">
          <i className="fas fa-shield-alt me-2"></i>
          Modo Administrador
        </small>
      </div>
    </div>
  );
};

export default AdminSidebar;