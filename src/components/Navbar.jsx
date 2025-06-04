import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Navbar = () => {
  const { currentUser, userData, userType, logout } = useAuth();
  const navigate = useNavigate();

  // Debug logs para el Navbar
  console.log('=== NAVBAR DEBUG ===');
  console.log('currentUser:', currentUser);
  console.log('userData:', userData);
  console.log('userType:', userType);
  console.log('userData?.tipo:', userData?.tipo);
  console.log('===================');

  const handleLogout = async () => {
    try {
      await logout();
      Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente', 'success');
      navigate('/login');
    } catch (error) {
      Swal.fire('Error', 'No se pudo cerrar sesión', 'error');
    }
  };

  // Verificar tipos de usuario - mejorar la detección
  const isAdmin = userData?.tipo === 'admin' || userType === 'admin';
  const isEmpresa = userData?.tipo === 'empresa' || userType === 'empresa';
  const isCliente = currentUser && !isAdmin && !isEmpresa;
  
  console.log('Tipos calculados:', { isAdmin, isEmpresa, isCliente });

  // Función para obtener el nombre del usuario
  const getUserDisplayName = () => {
    if (userData?.Nombre) return userData.Nombre;
    if (userData?.nombre) return userData.nombre;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Usuario';
  };

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
                {/* Opciones específicas para cada tipo de usuario */}
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        <i className="fas fa-tachometer-alt me-1"></i> Dashboard Admin
                      </Link>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="adminDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-cog me-1"></i> Administración
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                        <li>
                          <Link className="dropdown-item" to="/admin/empresas">
                            <i className="fas fa-building me-2"></i> Gestionar Empresas
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/clientes">
                            <i className="fas fa-users me-2"></i> Gestionar Clientes
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/administradores">
                            <i className="fas fa-user-shield me-2"></i> Gestionar Admins
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </>
                )}

                {isEmpresa && (
                  <>
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" disabled>
                        <i className="fas fa-box me-1"></i> Mis Productos
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" disabled>
                        <i className="fas fa-chart-bar me-1"></i> Estadísticas
                      </button>
                    </li>
                  </>
                )}

                {isCliente && (
                  <>
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" disabled>
                        <i className="fas fa-store me-1"></i> Catálogo
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" disabled>
                        <i className="fas fa-shopping-cart me-1"></i> Mis Pedidos
                      </button>
                    </li>
                  </>
                )}

                {/* Opciones comunes para usuarios autenticados */}
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">
                    <i className={`fas ${isAdmin ? 'fa-user-shield' : isEmpresa ? 'fa-building' : 'fa-user'} me-1`}></i> 
                    Mi Perfil
                  </Link>
                </li>

                {/* Dropdown del usuario */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className={`fas ${isAdmin ? 'fa-user-shield' : isEmpresa ? 'fa-building' : 'fa-user-circle'} me-1`}></i>
                    {getUserDisplayName()}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <h6 className="dropdown-header">
                        <i className="fas fa-info-circle me-2"></i>
                        {isAdmin ? 'Administrador' : isEmpresa ? 'Empresa' : 'Cliente'}
                      </h6>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/perfil">
                        <i className="fas fa-id-card me-2"></i> Ver perfil completo
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          <i className="fas fa-cogs me-2"></i> Panel de administración
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
                      </button>
                    </li>
                  </ul>
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
