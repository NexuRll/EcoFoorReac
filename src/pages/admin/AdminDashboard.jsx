import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerAdministradores, existeAdminPrincipal, ADMIN_PRINCIPAL_UID, COLECCION_ADMIN } from '../../services/admin';
import { obtenerUsuarios } from '../../services/admin/usuariosOperaciones';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/core/firebase';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    totalEmpresas: 0,
    totalUsuarios: 0,
    totalAdmins: 0,
    loading: true
  });
  const [existeAdmin, setExisteAdmin] = useState(false);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        // Verificar si existe administrador principal
        const adminExiste = await existeAdminPrincipal();
        setExisteAdmin(adminExiste);
        
        // Obtener estadísticas de administradores
        const admins = await obtenerAdministradores();
        
        // Obtener estadísticas de usuarios
        const usuarios = await obtenerUsuarios();
        
        // Obtener estadísticas de empresas
        const empresasSnapshot = await getDocs(collection(db, 'empresas'));
        
        setEstadisticas({
          totalEmpresas: empresasSnapshot.size,
          totalUsuarios: usuarios.length,
          totalAdmins: admins.length,
          loading: false
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setEstadisticas(prev => ({ ...prev, loading: false }));
      } finally {
        setVerificandoAdmin(false);
      }
    };

    cargarEstadisticas();
  }, []);

  // Función de emergencia para crear administrador principal
  const crearAdminEmergencia = async () => {
    try {
      const adminData = {
        Nombre: 'Administrador Principal',
        Correo: 'admin@ecofood.com',
        contraseña: 'admin123',
        Rol: 'admin',
        FechaCreacion: new Date().toISOString(),
        esAdminPrincipal: true
      };

      await setDoc(doc(db, COLECCION_ADMIN, ADMIN_PRINCIPAL_UID), adminData);
      
      Swal.fire({
        icon: 'success',
        title: 'Administrador creado',
        text: 'Administrador principal creado. Credenciales: admin@ecofood.com / admin123'
      });

      // Recargar el estado
      setExisteAdmin(true);
    } catch (error) {
      console.error('Error creando admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el administrador'
      });
    }
  };

  if (estadisticas.loading || verificandoAdmin) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando dashboard...</p>
      </div>
    );
  }

  // Si no existe administrador principal, mostrar instrucciones
  if (!existeAdmin) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning">
              <h4 className="alert-heading">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Configuración Inicial Requerida
              </h4>
              <p>No se ha configurado un administrador principal en el sistema.</p>
              <hr />
              <p className="mb-0">
                Ve a <Link to="/admin/administradores" className="alert-link">Administradores</Link> para configurar el administrador principal.
              </p>
            </div>
            
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">¿Cómo configurar el primer administrador?</h5>
              </div>
              <div className="card-body">
                <ol>
                  <li>Haz clic en <Link to="/admin/administradores">Administradores</Link></li>
                  <li>Completa el formulario con los datos del administrador principal</li>
                  <li>Una vez creado, tendrás acceso completo al dashboard</li>
                </ol>
                
                <div className="mt-3">
                  <Link to="/admin/administradores" className="btn btn-primary me-2">
                    <i className="fas fa-user-plus me-2"></i>
                    Configurar Administrador Principal
                  </Link>
                  
                  <button 
                    onClick={crearAdminEmergencia}
                    className="btn btn-danger"
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Crear Admin de Emergencia
                  </button>
                </div>
                
                <div className="alert alert-info mt-3">
                  <small>
                    <strong>Admin de Emergencia:</strong> Crea automáticamente un administrador con credenciales: admin@ecofood.com / admin123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-grow-1">
                <h4 className="mb-0">{estadisticas.totalEmpresas}</h4>
                <p className="mb-0">Empresas Registradas</p>
              </div>
              <div className="ms-3">
                <i className="fas fa-building fa-2x opacity-75"></i>
              </div>
            </div>
            <div className="card-footer bg-rgba-black-15">
              <Link to="/admin/empresas" className="text-white text-decoration-none">
                <small>Ver empresas <i className="fas fa-arrow-right ms-1"></i></small>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-grow-1">
                <h4 className="mb-0">{estadisticas.totalUsuarios}</h4>
                <p className="mb-0">Clientes</p>
              </div>
              <div className="ms-3">
                <i className="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
            <div className="card-footer bg-rgba-black-15">
              <Link to="/admin/clientes" className="text-white text-decoration-none">
                <small>Ver clientes <i className="fas fa-arrow-right ms-1"></i></small>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-grow-1">
                <h4 className="mb-0">{estadisticas.totalAdmins}</h4>
                <p className="mb-0">Administradores</p>
              </div>
              <div className="ms-3">
                <i className="fas fa-user-shield fa-2x opacity-75"></i>
              </div>
            </div>
            <div className="card-footer bg-rgba-black-15">
              <Link to="/admin/administradores" className="text-white text-decoration-none">
                <small>Ver administradores <i className="fas fa-arrow-right ms-1"></i></small>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <Link to="/admin/empresas" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3">
                    <i className="fas fa-plus-circle fa-2x mb-2"></i>
                    <span>Crear Nueva Empresa</span>
                  </Link>
                </div>
                <div className="col-md-4 mb-3">
                  <Link to="/admin/administradores" className="btn btn-outline-success w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3">
                    <i className="fas fa-user-plus fa-2x mb-2"></i>
                    <span>Agregar Administrador</span>
                  </Link>
                </div>
                <div className="col-md-4 mb-3">
                  <Link to="/admin/clientes" className="btn btn-outline-info w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3">
                    <i className="fas fa-search fa-2x mb-2"></i>
                    <span>Buscar Cliente</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Sistema
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Sistema funcionando correctamente
                </li>
                <li className="mb-2">
                  <i className="fas fa-database text-info me-2"></i>
                  Base de datos conectada
                </li>
                <li className="mb-2">
                  <i className="fas fa-shield-alt text-warning me-2"></i>
                  Autenticación activa
                </li>
                <li className="mb-0">
                  <i className="fas fa-cloud text-primary me-2"></i>
                  Firebase conectado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    