import React, { useState, useEffect } from 'react';
import { 
  obtenerAdminPrincipal, 
  existeAdminPrincipal, 
  ADMIN_PRINCIPAL_UID 
} from '../../../services/admin';
import { 
  obtenerAdministradores, 
  crearAdministrador, 
  actualizarAdministrador, 
  eliminarAdministrador 
} from '../../../services/admin/adminOperaciones';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import Swal from 'sweetalert2';

const AdminConfig = () => {
  const [adminPrincipal, setAdminPrincipal] = useState(null);
  const [existe, setExiste] = useState(false);
  const [loading, setLoading] = useState(true);
  const [administradores, setAdministradores] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [adminIdEdicion, setAdminIdEdicion] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Formulario para crear administrador principal
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    contraseña: '',
    Rol: 'admin'
  });
  
  // Formulario para crear/editar administradores normales
  const [formAdminNormal, setFormAdminNormal] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin'
  });
  
  // Cargar datos del administrador principal y todos los administradores
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Verificar si existe administrador principal
        const adminExiste = await existeAdminPrincipal();
        setExiste(adminExiste);
        
        if (adminExiste) {
          const adminData = await obtenerAdminPrincipal();
          setAdminPrincipal(adminData);
        }
        
        // Cargar lista de todos los administradores
        const listaAdmins = await obtenerAdministradores();
        setAdministradores(listaAdmins);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudieron cargar los datos: ${error.message}`
        });
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);
  
  // Manejar cambios en el formulario de admin principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambios en el formulario de admin normal
  const handleChangeNormal = (e) => {
    const { name, value } = e.target;
    setFormAdminNormal(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Crear administrador principal
  const handleCrearAdminPrincipal = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Verificar si ya existe
      const adminExiste = await existeAdminPrincipal();
      
      if (adminExiste) {
        Swal.fire({
          icon: 'warning',
          title: 'Administrador ya existe',
          text: 'Ya existe un administrador principal configurado'
        });
        return;
      }
      
      // Crear el administrador principal en Firestore
      await setDoc(doc(db, "Administrador", ADMIN_PRINCIPAL_UID), {
        ...formData,
        FechaCreacion: new Date().toISOString(),
        esAdminPrincipal: true
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Administrador Principal Creado',
        text: 'El administrador principal ha sido configurado correctamente'
      });
      
      // Recargar datos
      const adminData = await obtenerAdminPrincipal();
      setAdminPrincipal(adminData);
      setExiste(true);
      
      // Recargar lista de todos los administradores
      const listaAdmins = await obtenerAdministradores();
      setAdministradores(listaAdmins);
      
    } catch (error) {
      console.error("Error al crear administrador principal:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo crear el administrador principal: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Iniciar creación de nuevo administrador
  const handleNuevoAdmin = () => {
    setModoEdicion(false);
    setAdminIdEdicion(null);
    setFormAdminNormal({
      nombre: '',
      email: '',
      password: '',
      rol: 'admin'
    });
    setMostrarFormulario(true);
  };
  
  // Iniciar edición de administrador
  const handleEditarAdmin = (admin) => {
    setModoEdicion(true);
    setAdminIdEdicion(admin.id);
    setFormAdminNormal({
      nombre: admin.Nombre,
      email: admin.Correo,
      password: '', // No mostrar contraseña actual por seguridad
      rol: admin.Rol || 'admin'
    });
    setMostrarFormulario(true);
  };
  
  // Guardar administrador (crear o actualizar)
  const handleGuardarAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (modoEdicion) {
        // Actualizar administrador existente
        const datosActualizados = {
          Nombre: formAdminNormal.nombre,
          Rol: formAdminNormal.rol
        };
        
        // Incluir la contraseña solo si se ha proporcionado una nueva
        if (formAdminNormal.password) {
          datosActualizados.contraseña = formAdminNormal.password;
        }
        
        await actualizarAdministrador(adminIdEdicion, datosActualizados);
        
        Swal.fire({
          icon: 'success',
          title: 'Administrador Actualizado',
          text: 'El administrador ha sido actualizado correctamente'
        });
      } else {
        // Crear nuevo administrador
        await crearAdministrador(formAdminNormal);
        
        Swal.fire({
          icon: 'success',
          title: 'Administrador Creado',
          text: 'El nuevo administrador ha sido creado correctamente'
        });
      }
      
      // Recargar lista de administradores
      const listaAdmins = await obtenerAdministradores();
      setAdministradores(listaAdmins);
      
      // Cerrar formulario
      setMostrarFormulario(false);
      
    } catch (error) {
      console.error("Error al guardar administrador:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo guardar el administrador: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar administrador
  const handleEliminarAdmin = async (adminId, nombre) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al administrador ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarAdministrador(adminId);
          
          // Actualizar lista después de eliminar
          const listaActualizada = await obtenerAdministradores();
          setAdministradores(listaActualizada);
          
          Swal.fire(
            'Eliminado',
            'El administrador ha sido eliminado correctamente.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar administrador:", error);
          Swal.fire(
            'Error',
            error.message || 'No se pudo eliminar el administrador.',
            'error'
          );
        }
      }
    });
  };
  
  return (
    <div className="container">
      <h2 className="mb-4">Configuración de Administradores</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando configuración...</p>
        </div>
      ) : (
        <div className="row">
          {/* Panel del administrador principal */}
          <div className="col-12 mb-4">
            {existe && adminPrincipal ? (
              // Mostrar información del administrador principal
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Administrador Principal</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    El administrador principal no puede ser eliminado y tiene acceso completo al sistema.
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>ID:</strong> {adminPrincipal.id}</p>
                      <p><strong>Nombre:</strong> {adminPrincipal.Nombre}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Correo:</strong> {adminPrincipal.Correo}</p>
                      <p><strong>Rol:</strong> {adminPrincipal.Rol || 'Administrador'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Formulario para crear administrador principal
              <div className="card">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">Configurar Administrador Principal</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    No se ha configurado un administrador principal. Este administrador tendrá privilegios especiales y no podrá ser eliminado.
                  </div>
                  
                  <form onSubmit={handleCrearAdminPrincipal}>
                    <div className="mb-3">
                      <label htmlFor="Nombre" className="form-label">Nombre completo</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="Nombre" 
                        name="Nombre"
                        value={formData.Nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="Correo" className="form-label">Correo electrónico</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="Correo" 
                        name="Correo"
                        value={formData.Correo}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="contraseña" className="form-label">Contraseña</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="contraseña" 
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creando...' : 'Crear Administrador Principal'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          
          {/* Gestión de administradores */}
          {existe && (
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Gestión de Administradores</h5>
                  <button 
                    className="btn btn-light btn-sm" 
                    onClick={handleNuevoAdmin}
                    disabled={loading}
                  >
                    <i className="fas fa-plus me-1"></i> Nuevo Administrador
                  </button>
                </div>
                <div className="card-body">
                  {/* Formulario para crear/editar administrador */}
                  {mostrarFormulario && (
                    <div className="mb-4 p-3 border rounded bg-light">
                      <h5>{modoEdicion ? 'Editar Administrador' : 'Crear Nuevo Administrador'}</h5>
                      <form onSubmit={handleGuardarAdmin}>
                        <div className="mb-3">
                          <label htmlFor="nombre" className="form-label">Nombre completo</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="nombre" 
                            name="nombre"
                            value={formAdminNormal.nombre}
                            onChange={handleChangeNormal}
                            required
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            name="email"
                            value={formAdminNormal.email}
                            onChange={handleChangeNormal}
                            required={!modoEdicion}
                            readOnly={modoEdicion}
                          />
                          {modoEdicion && (
                            <small className="text-muted">El email no se puede modificar.</small>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            {modoEdicion ? 'Nueva contraseña (dejar en blanco para mantener actual)' : 'Contraseña'}
                          </label>
                          <input 
                            type="password" 
                            className="form-control" 
                            id="password" 
                            name="password"
                            value={formAdminNormal.password}
                            onChange={handleChangeNormal}
                            required={!modoEdicion}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="rol" className="form-label">Rol</label>
                          <select 
                            className="form-select" 
                            id="rol" 
                            name="rol"
                            value={formAdminNormal.rol}
                            onChange={handleChangeNormal}
                          >
                            <option value="admin">Administrador</option>
                            <option value="admin_ventas">Administrador de Ventas</option>
                            <option value="admin_productos">Administrador de Productos</option>
                          </select>
                        </div>
                        
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setMostrarFormulario(false)}
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            {loading ? 'Guardando...' : 'Guardar Administrador'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Lista de administradores */}
                  {administradores.length === 0 ? (
                    <p className="text-center py-3">No hay administradores registrados.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {administradores.map(admin => (
                            <tr key={admin.id}>
                              <td>{admin.Nombre}</td>
                              <td>{admin.Correo}</td>
                              <td>{admin.Rol || 'Administrador'}</td>
                              <td>
                                {admin.esAdminPrincipal ? (
                                  <span className="badge bg-success">Principal</span>
                                ) : (
                                  <span className="badge bg-info">Normal</span>
                                )}
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-secondary me-1"
                                  onClick={() => handleEditarAdmin(admin)}
                                  disabled={loading}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                {!admin.esAdminPrincipal && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleEliminarAdmin(admin.id, admin.Nombre)}
                                    disabled={loading}
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminConfig; 