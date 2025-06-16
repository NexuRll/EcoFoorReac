import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-success text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                <i className="fas fa-leaf me-3"></i>
                EcoFood
              </h1>
              <p className="lead mb-4">
                Conectamos empresas que tienen productos próximos a vencer con personas que los necesitan. 
                Reducimos el desperdicio de alimentos y ayudamos a las familias.
              </p>
              <div className="d-flex gap-3">
                <Link to="/register" className="btn btn-light btn-lg">
                  <i className="fas fa-user-plus me-2"></i>
                  Registrarse
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <i className="fas fa-seedling" style={{ fontSize: '8rem', opacity: 0.7 }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col">
              <h2 className="fw-bold mb-3">¿Cómo funciona EcoFood?</h2>
              <p className="text-muted">Una plataforma simple para reducir el desperdicio de alimentos</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-store text-success" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="fw-bold mb-3">Para Empresas</h5>
                  <p className="text-muted">
                    Publica productos próximos a vencer y evita el desperdicio. 
                    Ayuda a tu comunidad mientras reduces pérdidas.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-users text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="fw-bold mb-3">Para Familias</h5>
                  <p className="text-muted">
                    Encuentra productos de calidad a precios accesibles o gratuitos. 
                    Alimenta a tu familia de manera sostenible.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-recycle text-warning" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="fw-bold mb-3">Para el Planeta</h5>
                  <p className="text-muted">
                    Cada producto salvado es un paso hacia un futuro más sostenible. 
                    Juntos reducimos el impacto ambiental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">¿Listo para hacer la diferencia?</h3>
          <p className="text-muted mb-4">
            Únete a nuestra comunidad y ayuda a crear un mundo más sostenible
          </p>
          <Link to="/register" className="btn btn-success btn-lg">
            <i className="fas fa-rocket me-2"></i>
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 