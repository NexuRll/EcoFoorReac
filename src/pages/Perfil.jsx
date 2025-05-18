import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Perfil = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        timer: 1500
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar sesión: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Perfil de Usuario</h2>
            </div>
            <div className="card-body">
              {currentUser ? (
                <div>
                  <div className="text-center mb-4">
                    <div className="bg-light rounded-circle mx-auto d-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>
                      <i className="fas fa-user fa-3x text-success"></i>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="border-bottom pb-2">Información de la cuenta</h4>
                      <div className="p-3">
                        <p><i className="fas fa-envelope me-2 text-success"></i><strong>Email:</strong> {currentUser.email}</p>
                        <p><i className="fas fa-id-card me-2 text-success"></i><strong>ID de usuario:</strong> {currentUser.uid}</p>
                        <p><i className="fas fa-check-circle me-2 text-success"></i><strong>Verificado:</strong> {currentUser.emailVerified ? 'Sí' : 'No'}</p>
                        <p><i className="fas fa-calendar-alt me-2 text-success"></i><strong>Cuenta creada:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      className="btn btn-danger" 
                      onClick={handleLogout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cerrando sesión...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-success mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="lead">Cargando información del usuario...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;