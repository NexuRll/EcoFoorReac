import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { suscribirSolicitudesCliente } from '../../../services/productos/solicitudService';
import CarritoModal from '../../cliente/CarritoModal';

const NavCliente = () => {
  const { userData, logout, currentUser } = useAuth();
  const location = useLocation();
  const [showCarrito, setShowCarrito] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);

  // Suscribirse a cambios en las solicitudes para mostrar contador
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = suscribirSolicitudesCliente(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudes(solicitudesActualizadas);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const contarPendientes = () => {
    return solicitudes.filter(s => s.estado === 'pendiente').length;
  };

  const totalSolicitudes = solicitudes.length;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow">
        <div className="container-fluid">
          {/* Brand */}
          <Link className="navbar-brand fw-bold" to="/cliente/productos">
            <i className="fas fa-leaf me-2"></i>
            EcoFood
          </Link>

          {/* Mobile toggle */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarClienteContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation content */}
          <div className="collapse navbar-collapse" id="navbarClienteContent">
            {/* Main navigation */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/cliente/productos')}`} 
                  to="/cliente/productos"
                >
                  <i className="fas fa-shopping-basket me-1"></i>
                  Productos
                </Link>
              </li>
            </ul>

            {/* Carrito y User menu */}
            <ul className="navbar-nav">
              {/* Botón del Carrito */}
              <li className="nav-item me-2">
                <button 
                  className="btn btn-outline-light position-relative"
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
              </li>

              {/* User menu */}
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle d-flex align-items-center" 
                  href="#" 
                  id="navbarClienteDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="me-2">
                    <i className="fas fa-user-circle fa-lg"></i>
                  </div>
                  <div className="d-none d-md-block">
                    <small className="text-light">Hola,</small>
                    <br />
                    <span className="fw-bold">
                      {userData?.nombre?.split(' ')[0] || 'Cliente'}
                    </span>
                  </div>
                </a>
                
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <h6 className="dropdown-header">
                      <i className="fas fa-user me-2"></i>
                      {userData?.nombre || 'Cliente'}
                    </h6>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  
                  <li>
                    <Link className="dropdown-item" to="/cliente/perfil">
                      <i className="fas fa-user-edit me-2"></i>
                      Mi Perfil
                    </Link>
                  </li>
                  
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setShowCarrito(true)}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      Mi Carrito
                    </button>
                  </li>
                  
                  <li><hr className="dropdown-divider" /></li>
                  
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal del Carrito */}
      <CarritoModal 
        isOpen={showCarrito} 
        onClose={() => setShowCarrito(false)} 
      />
    </>
  );
};

export default NavCliente; 