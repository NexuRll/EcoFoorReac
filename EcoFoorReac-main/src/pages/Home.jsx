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

      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card bg-light border-0 shadow-sm">
            <div className="card-body p-4 text-center">
              <h2 className="mb-3">Sobre EcoFood</h2>
              <p className="lead">Somos una plataforma que conecta consumidores con productores locales de alimentos ecológicos y sostenibles.</p>
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
