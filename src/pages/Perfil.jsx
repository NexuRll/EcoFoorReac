import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import CerrarSesion from '../context/CerrarSesion';

const Perfil = () => {
  const { currentUser, logout, userType, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState(null);
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
        
        // Usar userData del contexto si está disponible
        if (userData) {
          setDatosUsuario(userData);
          setLoadingData(false);
          return;
        }
        
        // Determinar la colección según el tipo de usuario
        let collection = 'usuarios';
        if (userType === 'empresa') {
          collection = 'empresas';
        } else if (userType === 'admin') {
          collection = 'Administrador';
        }
        
        // Si es una empresa o admin, el ID ya está en el objeto currentUser
        // Si es un usuario normal, el ID está en currentUser.uid
        const userId = (userType === 'empresa' || userType === 'admin') ? currentUser.id || currentUser.uid : currentUser.uid;
        
        // Obtener los datos del usuario o empresa desde Firestore
        const userRef = doc(db, collection, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setDatosUsuario(userSnap.data());
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
  }, [currentUser, userType, userData]);

  // Función para navegar al dashboard de admin si es administrador
  const irAlDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Función para obtener el icono apropiado según el tipo de usuario
  const getIconByUserType = () => {
    switch (userType) {
      case 'empresa':
        return 'fa-building';
      case 'admin':
        return 'fa-user-shield';
      default:
        return 'fa-user';
    }
  };

  // Función para obtener el título apropiado según el tipo de usuario
  const getTitleByUserType = () => {
    switch (userType) {
      case 'empresa':
        return 'Perfil de Empresa';
      case 'admin':
        return 'Perfil de Administrador';
      default:
        return 'Perfil de Cliente';
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">
                  {getTitleByUserType()}
                </h2>
                {userType === 'admin' && (
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={irAlDashboard}
                  >
                    <i className="fas fa-cogs me-2"></i>
                    Ir al Panel Admin
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {currentUser ? (
                <div>
                  <div className="text-center mb-4">
                    <div className="bg-light rounded-circle mx-auto d-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>
                      <i className={`fas ${getIconByUserType()} fa-3x text-success`}></i>
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
                              (userType === 'empresa' || userType === 'admin') ? 
                              (datosUsuario?.Correo || datosUsuario?.email || currentUser.email) : 
                              currentUser.email
                            }
                          </p>
                          
                          <p>
                            <i className="fas fa-id-card me-2 text-success"></i>
                            <strong>ID:</strong> {
                              (userType === 'empresa' || userType === 'admin') ? 
                              (currentUser.id || currentUser.uid) : 
                              currentUser.uid
                            }
                          </p>
                          
                          {/* Nombre (disponible en ambos tipos) */}
                          <p>
                            <i className="fas fa-user me-2 text-success"></i>
                            <strong>Nombre:</strong> {
                              (userType === 'empresa' || userType === 'admin') ? 
                              (datosUsuario?.Nombre || datosUsuario?.nombre || 'No disponible') : 
                              (datosUsuario?.nombre || 'No disponible')
                            }
                          </p>
                          
                          {/* Tipo de usuario */}
                          <p>
                            <i className="fas fa-tag me-2 text-success"></i>
                            <strong>Tipo:</strong> {
                              userType === 'empresa' ? 'Empresa' : 
                              userType === 'admin' ? 'Administrador' : 
                              'Cliente'
                            }
                          </p>
                          
                          {/* Campos específicos según el tipo de usuario */}
                          {userType === 'empresa' ? (
                            // Campos específicos de empresa
                            <>
                              {datosUsuario?.rut && (
                                <p>
                                  <i className="fas fa-id-badge me-2 text-success"></i>
                                  <strong>RUT:</strong> {datosUsuario.rut}
                                </p>
                              )}
                              {datosUsuario?.direccion && (
                                <p>
                                  <i className="fas fa-map-marker-alt me-2 text-success"></i>
                                  <strong>Dirección:</strong> {datosUsuario.direccion}
                                </p>
                              )}
                              {datosUsuario?.comuna && (
                                <p>
                                  <i className="fas fa-city me-2 text-success"></i>
                                  <strong>Comuna:</strong> {datosUsuario.comuna}
                                </p>
                              )}
                              {datosUsuario?.telefono && (
                                <p>
                                  <i className="fas fa-phone me-2 text-success"></i>
                                  <strong>Teléfono:</strong> {datosUsuario.telefono}
                                </p>
                              )}
                              {datosUsuario?.fechaRegistro && (
                                <p>
                                  <i className="fas fa-calendar-alt me-2 text-success"></i>
                                  <strong>Registrado:</strong> {new Date(datosUsuario.fechaRegistro.seconds * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </>
                          ) : userType === 'admin' ? (
                            // Campos específicos de administrador
                            <>
                              <p>
                                <i className="fas fa-user-shield me-2 text-success"></i>
                                <strong>Rol:</strong> {datosUsuario?.Rol || 'Administrador'}
                              </p>
                              {datosUsuario?.esAdminPrincipal && (
                                <p>
                                  <i className="fas fa-crown me-2 text-warning"></i>
                                  <strong>Administrador Principal</strong>
                                </p>
                              )}
                              {datosUsuario?.fechaRegistro && (
                                <p>
                                  <i className="fas fa-calendar-alt me-2 text-success"></i>
                                  <strong>Registrado:</strong> {new Date(datosUsuario.fechaRegistro.seconds * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </>
                          ) : (
                            // Campos específicos de cliente
                            <>
                              {datosUsuario?.direccion && (
                                <p>
                                  <i className="fas fa-map-marker-alt me-2 text-success"></i>
                                  <strong>Dirección:</strong> {datosUsuario.direccion}
                                </p>
                              )}
                              {datosUsuario?.comuna && (
                                <p>
                                  <i className="fas fa-city me-2 text-success"></i>
                                  <strong>Comuna:</strong> {datosUsuario.comuna}
                                </p>
                              )}
                              {datosUsuario?.telefono && (
                                <p>
                                  <i className="fas fa-phone me-2 text-success"></i>
                                  <strong>Teléfono:</strong> {datosUsuario.telefono}
                                </p>
                              )}
                              {currentUser.emailVerified !== undefined && (
                                <p>
                                  <i className={`fas ${currentUser.emailVerified ? 'fa-check-circle' : 'fa-times-circle'} me-2 ${currentUser.emailVerified ? 'text-success' : 'text-warning'}`}></i>
                                  <strong>Email verificado:</strong> {currentUser.emailVerified ? 'Sí' : 'No'}
                                </p>
                              )}
                              {currentUser.metadata?.creationTime && (
                                <p>
                                  <i className="fas fa-calendar-alt me-2 text-success"></i>
                                  <strong>Cuenta creada:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones rápidas según tipo de usuario */}
                  {userType === 'empresa' && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h4 className="border-bottom pb-2">Acciones de Empresa</h4>
                        <div className="p-3">
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <button className="btn btn-outline-success w-100" disabled>
                                <i className="fas fa-box me-2"></i>
                                Gestionar Productos
                              </button>
                            </div>
                            <div className="col-md-6 mb-2">
                              <button className="btn btn-outline-info w-100" disabled>
                                <i className="fas fa-chart-bar me-2"></i>
                                Ver Estadísticas
                              </button>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Funcionalidades en desarrollo
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {userType === 'admin' && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h4 className="border-bottom pb-2">Acciones de Administrador</h4>
                        <div className="p-3">
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <Link to="/admin/empresas" className="btn btn-outline-primary w-100">
                                <i className="fas fa-building me-2"></i>
                                Gestionar Empresas
                              </Link>
                            </div>
                            <div className="col-md-6 mb-2">
                              <Link to="/admin/clientes" className="btn btn-outline-success w-100">
                                <i className="fas fa-users me-2"></i>
                                Gestionar Clientes
                              </Link>
                            </div>
                            <div className="col-md-6 mb-2">
                              <Link to="/admin/administradores" className="btn btn-outline-warning w-100">
                                <i className="fas fa-user-shield me-2"></i>
                                Gestionar Admins
                              </Link>
                            </div>
                            <div className="col-md-6 mb-2">
                              <Link to="/admin/dashboard" className="btn btn-primary w-100">
                                <i className="fas fa-tachometer-alt me-2"></i>
                                Dashboard Principal
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userType === 'cliente' && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h4 className="border-bottom pb-2">Acciones de Cliente</h4>
                        <div className="p-3">
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <Link to="/catalogo" className="btn btn-outline-success w-100">
                                <i className="fas fa-store me-2"></i>
                                Ver Catálogo
                              </Link>
                            </div>
                            <div className="col-md-6 mb-2">
                              <button className="btn btn-outline-info w-100" disabled>
                                <i className="fas fa-shopping-cart me-2"></i>
                                Mis Pedidos
                              </button>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Algunas funcionalidades en desarrollo
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2 mt-4">
                    <CerrarSesion />
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