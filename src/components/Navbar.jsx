import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente', 'success');
      navigate('/login');
    } catch (error) {
      Swal.fire('Error', 'No se pudo cerrar sesión', 'error');
    }
  };

  // Verificar si el usuario es administrador
  const isAdmin = userData?.tipo === 'admin';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-leaf me-2"></i>
          EcoFood
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to={currentUser ? "/catalogo" : "/"}>
                <i className="fas fa-home me-1"></i> Inicio
              </Link>
            </li>
            {!currentUser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="fas fa-user-plus me-1"></i> Registrarse
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Mostrar enlace al panel de administración si es admin */}
                {isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/dashboard">
                      <i className="fas fa-cogs me-1"></i> Panel Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/catalogo">
                    <i className="fas fa-leaf me-1"></i> Catálogo
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">
                    <i className="fas fa-user me-1"></i> Perfil
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i> Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
