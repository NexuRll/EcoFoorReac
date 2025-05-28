import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import AuthWrapper from './components/AuthWrapper';
import { useAuth } from './context/AuthContext';

// Componente que utiliza el contexto de autenticación
const AppContent = () => {
  const { currentUser, loading } = useAuth();
  
  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success mb-4">
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
                <Link className="nav-link" to="/">
                  <i className="fas fa-home me-1"></i> Inicio
                </Link>
              </li>
              
              {currentUser ? (
                // Opciones para usuarios autenticados
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/perfil">
                      <i className="fas fa-user me-1"></i> Mi Perfil
                    </Link>
                  </li>
                </>
              ) : (
                // Opciones para usuarios no autenticados
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
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando la aplicación...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
            <Route path="/perfil" element={currentUser ? <Perfil /> : <Navigate to="/login" />} />
            <Route path="*" element={<Home />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App; 