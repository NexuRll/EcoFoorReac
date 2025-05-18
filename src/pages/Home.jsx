import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12 text-center mb-4">
          <div className="p-5 mb-4 bg-success text-white rounded-3">
            <div className="container-fluid py-5">
              <h1 className="display-4 fw-bold">Bienvenido a EcoFood</h1>
              <p className="fs-4 mt-3">Tu plataforma para productos ecológicos y sostenibles</p>
              <p className="mt-4">
                <Link to="/login" className="btn btn-light btn-lg me-2">
                  <i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">
                  <i className="fas fa-user-plus me-2"></i>Registrarse
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="fas fa-leaf fa-3x text-success mb-3"></i>
              <h3 className="card-title">Productos Ecológicos</h3>
              <p className="card-text">Descubre nuestra amplia selección de productos orgánicos y ecológicos cultivados con amor por la naturaleza.</p>
              <button className="btn btn-outline-success">
                <i className="fas fa-apple-alt me-2"></i>Ver productos
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="fas fa-users fa-3x text-success mb-3"></i>
              <h3 className="card-title">Productores Locales</h3>
              <p className="card-text">Conoce a los productores locales que hacen posible nuestra misión de llevar alimentos saludables a tu mesa.</p>
              <button className="btn btn-outline-success">
                <i className="fas fa-user-friends me-2"></i>Ver productores
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="fas fa-truck fa-3x text-success mb-3"></i>
              <h3 className="card-title">Entregas Sostenibles</h3>
              <p className="card-text">Nuestras entregas son realizadas con métodos de transporte que minimizan el impacto ambiental.</p>
              <button className="btn btn-outline-success">
                <i className="fas fa-info-circle me-2"></i>Más información
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light border-0">
            <div className="card-body p-4 text-center">
              <h2 className="mb-3">Nuestro Compromiso</h2>
              <p className="lead">En EcoFood nos comprometemos a ofrecer productos de la más alta calidad, respetando el medio ambiente y apoyando a los productores locales.</p>
              <hr className="my-4" />
              <p>Regístrate hoy para comenzar a disfrutar de productos frescos y ecológicos directamente en tu hogar.</p>
              <Link to="/register" className="btn btn-success btn-lg">
                <i className="fas fa-user-plus me-2"></i>Unirse a EcoFood
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
