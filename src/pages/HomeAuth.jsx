import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeAuth = () => {
  const { userData, userType } = useAuth();
  
  // Verificar si es administrador
  const isAdmin = userData?.tipo === 'admin' || userType === 'admin';
  const isEmpresa = userData?.tipo === 'empresa' || userType === 'empresa';
  const isCliente = !isAdmin && !isEmpresa;

  return (
    <div className="container mt-4">
      {/* Banner especial para administradores */}
      {isAdmin && (
        <div className="alert alert-warning mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="alert-heading mb-2">
                <i className="fas fa-user-shield me-2"></i>
                Panel de Administrador Disponible
              </h5>
              <p className="mb-0">
                Tienes acceso al panel de administración para gestionar empresas, usuarios y configuraciones del sistema.
              </p>
            </div>
            <div className="col-md-4 text-end">
              <Link to="/admin/dashboard" className="btn btn-warning">
                <i className="fas fa-cogs me-2"></i>
                Ir al Panel Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Banner especial para empresas */}
      {isEmpresa && (
        <div className="alert alert-info mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="alert-heading mb-2">
                <i className="fas fa-building me-2"></i>
                Área de Empresa
              </h5>
              <p className="mb-0">
                Desde aquí puedes gestionar tu perfil de empresa. Próximamente tendrás acceso a la gestión de productos.
              </p>
            </div>
            <div className="col-md-4 text-end">
              <Link to="/perfil" className="btn btn-info">
                <i className="fas fa-user-cog me-2"></i>
                Ver Mi Perfil
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header principal */}
      <div className="jumbotron bg-light p-5 rounded mb-4">
        <h1 className="display-4">
          ¡Bienvenido{isEmpresa ? ' a EcoFood Empresas' : isAdmin ? ' Administrador' : ' a EcoFood'}!
        </h1>
        <p className="lead">
          {isEmpresa 
            ? 'Gestiona tu empresa y próximamente tus productos en nuestra plataforma ecológica.'
            : isAdmin 
            ? 'Administra el sistema EcoFood desde tu panel de control.'
            : 'Tu plataforma para encontrar los mejores productos ecológicos directamente de productores locales.'
          }
        </p>
        <hr className="my-4" />
        <p>
          {isEmpresa 
            ? 'Mantén actualizada la información de tu empresa y prepárate para ofrecer tus productos.'
            : isAdmin 
            ? 'Gestiona empresas, usuarios y configuraciones del sistema desde tu dashboard.'
            : 'Explora nuestro catálogo de productos frescos y sostenibles, conoce a los productores de tu región y contribuye a un mundo más verde.'
          }
        </p>
        
        <div className="mt-4">
          {isAdmin ? (
            <Link to="/admin/dashboard" className="btn btn-warning btn-lg me-3">
              <i className="fas fa-tachometer-alt me-2"></i>
              Ir al Dashboard
            </Link>
          ) : isEmpresa ? (
            <Link to="/perfil" className="btn btn-primary btn-lg me-3">
              <i className="fas fa-building me-2"></i>
              Ver Mi Perfil
            </Link>
          ) : (
            <Link to="/perfil" className="btn btn-success btn-lg me-3">
              <i className="fas fa-user me-2"></i>
              Ver Mi Perfil
            </Link>
          )}
          
          {!isAdmin && (
            <button className="btn btn-outline-secondary btn-lg" disabled>
              <i className="fas fa-store me-2"></i>
              Catálogo (Próximamente)
            </button>
          )}
        </div>
      </div>

      {/* Secciones específicas según tipo de usuario */}
      {isCliente && (
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-leaf fa-3x text-success mb-3"></i>
                <h5 className="card-title">Productos Ecológicos</h5>
                <p className="card-text">
                  Descubre productos frescos y orgánicos directamente de productores locales.
                </p>
                <button className="btn btn-outline-success" disabled>
                  <i className="fas fa-shopping-basket me-2"></i>
                  Explorar (Próximamente)
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-users fa-3x text-primary mb-3"></i>
                <h5 className="card-title">Productores Locales</h5>
                <p className="card-text">
                  Conoce a los agricultores y empresas que cultivan de manera sostenible.
                </p>
                <button className="btn btn-outline-primary" disabled>
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Ver Mapa (Próximamente)
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-heart fa-3x text-danger mb-3"></i>
                <h5 className="card-title">Favoritos</h5>
                <p className="card-text">
                  Guarda tus productos y productores favoritos para encontrarlos fácilmente.
                </p>
                <button className="btn btn-outline-danger" disabled>
                  <i className="fas fa-bookmark me-2"></i>
                  Mis Favoritos (Próximamente)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmpresa && (
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-box fa-3x text-primary mb-3"></i>
                <h5 className="card-title">Gestión de Productos</h5>
                <p className="card-text">
                  Administra tu catálogo de productos ecológicos y mantén actualizado tu inventario.
                </p>
                <button className="btn btn-outline-primary" disabled>
                  <i className="fas fa-plus-circle me-2"></i>
                  Agregar Productos (Próximamente)
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-chart-line fa-3x text-success mb-3"></i>
                <h5 className="card-title">Estadísticas</h5>
                <p className="card-text">
                  Visualiza las métricas de tu empresa y el rendimiento de tus productos.
                </p>
                <button className="btn btn-outline-success" disabled>
                  <i className="fas fa-analytics me-2"></i>
                  Ver Reportes (Próximamente)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional para todos los usuarios */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="bg-success text-white p-4 rounded">
            <h3 className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Sobre EcoFood
            </h3>
            <div className="row">
              <div className="col-md-4">
                <h5><i className="fas fa-seedling me-2"></i>Sostenibilidad</h5>
                <p>Promovemos prácticas agrícolas sostenibles que cuidan el medio ambiente.</p>
              </div>
              <div className="col-md-4">
                <h5><i className="fas fa-handshake me-2"></i>Comunidad Local</h5>
                <p>Conectamos consumidores con productores locales para fortalecer la economía regional.</p>
              </div>
              <div className="col-md-4">
                <h5><i className="fas fa-award me-2"></i>Calidad</h5>
                <p>Garantizamos productos de la más alta calidad con certificaciones ecológicas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAuth;
