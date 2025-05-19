import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Perfil = () => {
  const { currentUser, logout, userType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  // Efecto para cargar los datos del usuario o empresa desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoadingData(false);
        return;
      }
      
      try {
        setLoadingData(true);
        
        // Determinar la colección según el tipo de usuario
        const collection = userType === 'empresa' ? 'Empresas' : 'usuarios';
        
        // Si es una empresa, el ID ya está en el objeto currentUser
        // Si es un usuario normal, el ID está en currentUser.uid
        const userId = userType === 'empresa' ? currentUser.id : currentUser.uid;
        
        // Obtener los datos del usuario o empresa desde Firestore
        const userRef = doc(db, collection, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.error('No se encontraron datos para este usuario/empresa');
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, userType]);

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
              <h2 className="mb-0">
                {userType === 'empresa' ? 'Perfil de Empresa' : 
                 userType === 'admin' ? 'Perfil de Administrador' : 
                 'Perfil de Usuario'}
              </h2>
            </div>
            <div className="card-body">
              {currentUser ? (
                <div>
                  <div className="text-center mb-4">
                    <div className="bg-light rounded-circle mx-auto d-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>
                      <i className={`fas ${userType === 'empresa' ? 'fa-building' : userType === 'admin' ? 'fa-user-shield' : 'fa-user'} fa-3x text-success`}></i>
                    </div>
                  </div>
                  
                  {loadingData ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p>Cargando información...</p>
                    </div>
                  ) : (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h4 className="border-bottom pb-2">Información de la cuenta</h4>
                        <div className="p-3">
                          {/* Información común para todos los tipos de usuarios */}
                          <p>
                            <i className="fas fa-envelope me-2 text-success"></i>
                            <strong>Email:</strong> {
                              userType === 'empresa' || userType === 'admin' ? 
                              userData?.Correo || currentUser.email : 
                              currentUser.email
                            }
                          </p>
                          
                          <p>
                            <i className="fas fa-id-card me-2 text-success"></i>
                            <strong>ID:</strong> {
                              userType === 'empresa' || userType === 'admin' ? 
                              currentUser.id : 
                              currentUser.uid
                            }
                          </p>
                          
                          {/* Nombre (disponible en ambos tipos) */}
                          <p>
                            <i className="fas fa-user me-2 text-success"></i>
                            <strong>Nombre:</strong> {
                              userType === 'empresa' || userType === 'admin' ? 
                              userData?.Nombre || 'No disponible' : 
                              userData?.nombre || 'No disponible'
                            }
                          </p>
                          
                          {/* Tipo de usuario */}
                          <p>
                            <i className="fas fa-tag me-2 text-success"></i>
                            <strong>Tipo:</strong> {
                              userType === 'empresa' ? 'Empresa' : 
                              userType === 'admin' ? 'Administrador' : 
                              userData?.tipoUsuario || 'Usuario'
                            }
                          </p>
                          
                          {/* Campos específicos según el tipo de usuario */}
                          {userType === 'empresa' ? (
                            // Campos específicos de empresa
                            <>
                              {/* Agrega aquí campos específicos de empresas si los hay */}
                            </>
                          ) : userType === 'admin' ? (
                            // Campos específicos de administrador
                            <>
                              <p>
                                <i className="fas fa-user-shield me-2 text-success"></i>
                                <strong>Rol:</strong> {userData?.tipoUsuario || 'Admin'}
                              </p>
                            </>
                          ) : (
                            // Campos específicos de usuario normal
                            <>
                              <p><i className="fas fa-map-marker-alt me-2 text-success"></i><strong>Dirección:</strong> {userData?.direccion || 'No disponible'}</p>
                              <p><i className="fas fa-city me-2 text-success"></i><strong>Comuna:</strong> {userData?.comuna || 'No disponible'}</p>
                              <p><i className="fas fa-phone me-2 text-success"></i><strong>Teléfono:</strong> {userData?.telefono || 'No disponible'}</p>
                              {currentUser.emailVerified !== undefined && (
                                <p><i className="fas fa-check-circle me-2 text-success"></i><strong>Verificado:</strong> {currentUser.emailVerified ? 'Sí' : 'No'}</p>
                              )}
                              {currentUser.metadata?.creationTime && (
                                <p><i className="fas fa-calendar-alt me-2 text-success"></i><strong>Cuenta creada:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  
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