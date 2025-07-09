import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ClienteSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/cliente/productos',
      icon: 'fas fa-shopping-basket',
      label: 'Productos'
    },
    {
      path: '/cliente/perfil',
      icon: 'fas fa-user',
      label: 'Mi Perfil'
    }
  ];

  return (
    <div className="ecofood-sidebar d-flex flex-column">
      {/* Logo/Brand del Sidebar */}
      <div className="sidebar-brand">
        <Link to="/cliente/productos" className="text-white text-decoration-none">
          <div className="d-flex align-items-center">
            <div className="brand-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div>
              <h5 className="mb-0">EcoFood</h5>
              <small className="text-muted">Cliente</small>
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
          <i className="fas fa-user me-2"></i>
          Modo Cliente
        </small>
      </div>
    </div>
  );
};

export default ClienteSidebar;