import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const HomeAuth = () => {
  const { userData, userType, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">
                <i className="fas fa-home me-2"></i>
                Bienvenido a EcoFood
              </h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h4>¡Hola, {userData?.nombre || 'Usuario'}!</h4>
                  <p className="text-muted mb-4">
                    Tipo de cuenta: <span className="badge bg-primary">{userType}</span>
                  </p>
                  
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>¡Bienvenido a EcoFood!</strong> Tu plataforma para reducir el desperdicio de alimentos.
                  </div>

                  {userType === 'admin' && (
                    <div className="alert alert-warning">
                      <i className="fas fa-crown me-2"></i>
                      <strong>Panel de Administrador:</strong> Tienes acceso completo al sistema.
                      <div className="mt-2">
                        <Link to="/admin/dashboard" className="btn btn-warning btn-sm me-2">
                          <i className="fas fa-tachometer-alt me-1"></i>
                          Ir al Dashboard Admin
                        </Link>
                      </div>
                    </div>
                  )}

                  {userType === 'empresa' && (
                    <div className="alert alert-success">
                      <i className="fas fa-store me-2"></i>
                      <strong>Panel de Empresa:</strong> Gestiona tus productos y perfil empresarial.
                      <div className="mt-2">
                        <Link to="/empresa/dashboard" className="btn btn-success btn-sm me-2">
                          <i className="fas fa-tachometer-alt me-1"></i>
                          Dashboard Empresa
                        </Link>
                        <Link to="/empresa/productos" className="btn btn-outline-success btn-sm me-2">
                          <i className="fas fa-box me-1"></i>
                          Mis Productos
                        </Link>
                        <Link to="/empresa/perfil" className="btn btn-outline-success btn-sm">
                          <i className="fas fa-building me-1"></i>
                          Mi Perfil
                        </Link>
                      </div>
                    </div>
                  )}

                  {userType === 'cliente' && (
                    <div className="alert alert-primary">
                      <i className="fas fa-user me-2"></i>
                      <strong>Panel de Cliente:</strong> Explora productos disponibles y gestiona tu perfil.
                      <div className="mt-2">
                        <Link to="/catalogo" className="btn btn-primary btn-sm me-2">
                          <i className="fas fa-search me-1"></i>
                          Explorar Productos
                        </Link>
                        <Link to="/perfil" className="btn btn-outline-primary btn-sm">
                          <i className="fas fa-user-cog me-1"></i>
                          Mi Perfil
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <i className="fas fa-leaf text-success mb-3" style={{ fontSize: '3rem' }}></i>
                      <h5>EcoFood</h5>
                      <p className="small text-muted">
                        Reduciendo el desperdicio de alimentos, un producto a la vez.
                      </p>
                      
                      <div className="d-grid gap-2 mt-3">
                        <Link to="/perfil" className="btn btn-outline-success btn-sm">
                          <i className="fas fa-user me-1"></i>
                          Ver Perfil
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="fas fa-sign-out-alt me-1"></i>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-recycle text-success mb-2" style={{ fontSize: '2rem' }}></i>
              <h5>Productos Salvados</h5>
              <h3 className="text-success">1,234</h3>
              <small className="text-muted">Este mes</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-users text-primary mb-2" style={{ fontSize: '2rem' }}></i>
              <h5>Familias Ayudadas</h5>
              <h3 className="text-primary">567</h3>
              <small className="text-muted">Este mes</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-store text-warning mb-2" style={{ fontSize: '2rem' }}></i>
              <h5>Empresas Activas</h5>
              <h3 className="text-warning">89</h3>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAuth; 