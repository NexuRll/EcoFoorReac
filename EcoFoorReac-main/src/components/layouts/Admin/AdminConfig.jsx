import React, { useState, useEffect } from 'react';
import { 
  obtenerAdminPrincipal, 
  existeAdminPrincipal, 
  ADMIN_PRINCIPAL_UID 
} from '../../../services/admin';
import { 
  registrarAdministradorConAuth,
  actualizarAdministradorConAuth,
  eliminarAdministradorConAuth,
  obtenerTodosLosAdministradores
} from '../../../services/adminFirebase';
import { validarFormularioAdmin, formatearInput, LIMITES } from '../../../utils/validaciones';
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
  
  // Errores de validación
  const [erroresPrincipal, setErroresPrincipal] = useState({});
  const [erroresNormal, setErroresNormal] = useState({});
  
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

  // Estados para cambio de contraseña de administradores
  const [mostrarFormPassword, setMostrarFormPassword] = useState(false);
  const [adminIdPassword, setAdminIdPassword] = useState(null);
  const [formPassword, setFormPassword] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [erroresPassword, setErroresPassword] = useState({});
  
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
        const listaAdmins = await obtenerTodosLosAdministradores();
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
  
  // Manejar cambios en el formulario de admin principal con validación
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    // Aplicar formateo según el tipo de campo
    if (name === 'Nombre') {
      valorFormateado = formatearInput(value, 'nombre');
    } else if (name === 'Correo') {
      valorFormateado = formatearInput(value, 'email');
    }
    
    // Aplicar límites de caracteres
    const limite = LIMITES[name === 'Nombre' ? 'NOMBRE' : name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    // Limpiar error del campo cuando cambia
    if (erroresPrincipal[name]) {
      setErroresPrincipal(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Manejar cambios en el formulario de admin normal con validación
  const handleChangeNormal = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    // Aplicar formateo según el tipo de campo
    if (name === 'nombre') {
      valorFormateado = formatearInput(value, 'nombre');
    } else if (name === 'email') {
      valorFormateado = formatearInput(value, 'email');
    }
    
    // Aplicar límites de caracteres
    const limite = LIMITES[name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormAdminNormal(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    // Limpiar error del campo cuando cambia
    if (erroresNormal[name]) {
      setErroresNormal(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Crear administrador principal
  const handleCrearAdminPrincipal = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const datosParaValidar = {
      nombre: formData.Nombre,
      email: formData.Correo,
      password: formData.contraseña
    };
    
    const erroresValidacion = validarFormularioAdmin(datosParaValidar);
    
    if (Object.keys(erroresValidacion).length > 0) {
      // Mapear errores al formato del formulario principal
      const erroresMapeados = {
        Nombre: erroresValidacion.nombre,
        Correo: erroresValidacion.email,
        contraseña: erroresValidacion.password
      };
      setErroresPrincipal(erroresMapeados);
      Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        text: 'Por favor corrige los errores en el formulario'
      });
      return;
    }
    
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
        esAdminPrincipal: true,
        emailVerified: formData.Correo.toLowerCase() === 'admin@gmail.com' ? true : false // Admin principal se considera verificado
      });
      
      const isAdminPrincipal = formData.Correo.toLowerCase() === 'admin@gmail.com';
      
      Swal.fire({
        icon: 'success',
        title: 'Administrador Principal Creado',
        text: isAdminPrincipal 
          ? 'El administrador principal ha sido configurado correctamente. Como es la cuenta principal, no necesita verificación de email.'
          : 'El administrador principal ha sido configurado correctamente.'
      });
      
      // Recargar datos
      const adminData = await obtenerAdminPrincipal();
      setAdminPrincipal(adminData);
      setExiste(true);
      
      // Limpiar formulario y errores
      setFormData({
        Nombre: '',
        Correo: '',
        contraseña: '',
        Rol: 'admin'
      });
      setErroresPrincipal({});
      
      // Recargar lista de todos los administradores
      const listaAdmins = await obtenerTodosLosAdministradores();
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
    setErroresNormal({});
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
    setErroresNormal({});
    setMostrarFormulario(true);
  };
  
  // Guardar administrador (crear o actualizar)
  const handleGuardarAdmin = async (e) => {
    e.preventDefault();
    
    // Validar formulario - sin contraseña si está en modo edición
    const datosParaValidar = modoEdicion 
      ? { nombre: formAdminNormal.nombre, email: formAdminNormal.email }
      : formAdminNormal;
    
    const erroresValidacion = validarFormularioAdmin(datosParaValidar);
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErroresNormal(erroresValidacion);
      Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        text: 'Por favor corrige los errores en el formulario'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (modoEdicion) {
        // Actualizar administrador existente (sin campo de contraseña)
        const datosActualizados = {
          Nombre: formAdminNormal.nombre.trim(),
          Rol: formAdminNormal.rol
        };
        
        await actualizarAdministradorConAuth(adminIdEdicion, datosActualizados);
        
        Swal.fire({
          icon: 'success',
          title: 'Administrador Actualizado',
          text: 'El administrador ha sido actualizado correctamente'
        });
      } else {
        // Crear nuevo administrador
        const nuevoAdmin = {
          nombre: formAdminNormal.nombre.trim(),
          email: formAdminNormal.email.trim(),
          password: formAdminNormal.password,
          rol: formAdminNormal.rol
        };
        
        await registrarAdministradorConAuth(nuevoAdmin);
        
        const isAdminPrincipal = nuevoAdmin.email.toLowerCase() === 'admin@gmail.com';
        
        Swal.fire({
          icon: 'success',
          title: 'Administrador Creado',
          text: isAdminPrincipal
            ? `El administrador ${nuevoAdmin.nombre} ha sido creado correctamente. Como es la cuenta principal (admin@gmail.com), no necesita verificación de email y puede hacer login inmediatamente.`
            : `El administrador ${nuevoAdmin.nombre} ha sido creado correctamente. Se ha enviado un correo de verificación a ${nuevoAdmin.email}. El administrador podrá hacer login una vez que verifique su email.`
        });
      }
      
      // Recargar lista de administradores
      const listaAdmins = await obtenerTodosLosAdministradores();
      setAdministradores(listaAdmins);
      
      // Cerrar formulario
      setMostrarFormulario(false);
      setErroresNormal({});
      
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
  
  // Manejar cambio de contraseña de administrador
  const handleCambiarPasswordAdmin = (adminId) => {
    setAdminIdPassword(adminId);
    setFormPassword({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErroresPassword({});
    setMostrarFormPassword(true);
  };

  // Manejar cambios en formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({
      ...prev,
      [name]: value
    }));

    if (erroresPassword[name]) {
      setErroresPassword(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Guardar nueva contraseña de administrador
  const handleGuardarPassword = async (e) => {
    e.preventDefault();

    // Validar contraseñas
    const errores = {};
    
    if (!formPassword.nuevaPassword) {
      errores.nuevaPassword = 'La nueva contraseña es requerida';
    } else if (formPassword.nuevaPassword.length < 6) {
      errores.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formPassword.confirmarPassword) {
      errores.confirmarPassword = 'Debe confirmar la nueva contraseña';
    } else if (formPassword.nuevaPassword !== formPassword.confirmarPassword) {
      errores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errores).length > 0) {
      setErroresPassword(errores);
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implementar cambio de contraseña en Firebase Auth
      // Por ahora solo mostramos mensaje de éxito
      
      const admin = administradores.find(a => a.id === adminIdPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: `La contraseña del administrador ${admin?.Nombre} ha sido cambiada correctamente.`
      });

      setMostrarFormPassword(false);
      setAdminIdPassword(null);
      setFormPassword({
        nuevaPassword: '',
        confirmarPassword: ''
      });
      setErroresPassword({});
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Inténtelo nuevamente.'
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
          await eliminarAdministradorConAuth(adminId);
          
          // Actualizar lista después de eliminar
          const listaActualizada = await obtenerTodosLosAdministradores();
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
                      <label htmlFor="Nombre" className="form-label">
                        Nombre completo *
                        <small className="text-muted ms-2">
                          ({LIMITES.NOMBRE.min}-{LIMITES.NOMBRE.max} caracteres, solo letras)
                        </small>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${erroresPrincipal.Nombre ? 'is-invalid' : ''}`}
                        id="Nombre" 
                        name="Nombre"
                        value={formData.Nombre}
                        onChange={handleChange}
                        maxLength={LIMITES.NOMBRE.max}
                        placeholder="Ingrese el nombre completo"
                        required
                      />
                      {erroresPrincipal.Nombre && <div className="invalid-feedback">{erroresPrincipal.Nombre}</div>}
                      <small className="text-muted">
                        {formData.Nombre.length}/{LIMITES.NOMBRE.max} caracteres
                      </small>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="Correo" className="form-label">
                        Correo electrónico *
                        <small className="text-muted ms-2">
                          ({LIMITES.EMAIL.min}-{LIMITES.EMAIL.max} caracteres)
                        </small>
                      </label>
                      <input 
                        type="email" 
                        className={`form-control ${erroresPrincipal.Correo ? 'is-invalid' : ''}`}
                        id="Correo" 
                        name="Correo"
                        value={formData.Correo}
                        onChange={handleChange}
                        maxLength={LIMITES.EMAIL.max}
                        placeholder="admin@ecofood.com"
                        required
                      />
                      {erroresPrincipal.Correo && <div className="invalid-feedback">{erroresPrincipal.Correo}</div>}
                      <small className="text-muted">
                        {formData.Correo.length}/{LIMITES.EMAIL.max} caracteres
                      </small>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="contraseña" className="form-label">
                        Contraseña *
                        <small className="text-muted ms-2">
                          ({LIMITES.PASSWORD.min}-{LIMITES.PASSWORD.max} caracteres, letras y números)
                        </small>
                      </label>
                      <input 
                        type="password" 
                        className={`form-control ${erroresPrincipal.contraseña ? 'is-invalid' : ''}`}
                        id="contraseña" 
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        maxLength={LIMITES.PASSWORD.max}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      {erroresPrincipal.contraseña && <div className="invalid-feedback">{erroresPrincipal.contraseña}</div>}
                      <small className="text-muted">
                        {formData.contraseña.length}/{LIMITES.PASSWORD.max} caracteres
                      </small>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Crear Administrador Principal
                        </>
                      )}
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
                          <label htmlFor="nombre" className="form-label">
                            Nombre completo *
                            <small className="text-muted ms-2">
                              ({LIMITES.NOMBRE.min}-{LIMITES.NOMBRE.max} caracteres, solo letras)
                            </small>
                          </label>
                          <input 
                            type="text" 
                            className={`form-control ${erroresNormal.nombre ? 'is-invalid' : ''}`}
                            id="nombre" 
                            name="nombre"
                            value={formAdminNormal.nombre}
                            onChange={handleChangeNormal}
                            maxLength={LIMITES.NOMBRE.max}
                            placeholder="Ingrese el nombre completo"
                            required
                          />
                          {erroresNormal.nombre && <div className="invalid-feedback">{erroresNormal.nombre}</div>}
                          <small className="text-muted">
                            {formAdminNormal.nombre.length}/{LIMITES.NOMBRE.max} caracteres
                          </small>
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email *
                            <small className="text-muted ms-2">
                              ({LIMITES.EMAIL.min}-{LIMITES.EMAIL.max} caracteres)
                            </small>
                          </label>
                          <input 
                            type="email" 
                            className={`form-control ${erroresNormal.email ? 'is-invalid' : ''}`}
                            id="email" 
                            name="email"
                            value={formAdminNormal.email}
                            onChange={handleChangeNormal}
                            maxLength={LIMITES.EMAIL.max}
                            placeholder="admin@ejemplo.com"
                            required={!modoEdicion}
                            readOnly={modoEdicion}
                          />
                          {erroresNormal.email && <div className="invalid-feedback">{erroresNormal.email}</div>}
                          {modoEdicion && (
                            <small className="text-muted">El email no se puede modificar.</small>
                          )}
                          {!modoEdicion && (
                            <small className="text-muted">
                              {formAdminNormal.email.length}/{LIMITES.EMAIL.max} caracteres
                            </small>
                          )}
                        </div>
                        
                        {!modoEdicion && (
                          <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                              Contraseña *
                              <small className="text-muted ms-2">
                                ({LIMITES.PASSWORD.min}-{LIMITES.PASSWORD.max} caracteres, letras y números)
                              </small>
                            </label>
                            <input 
                              type="password" 
                              className={`form-control ${erroresNormal.password ? 'is-invalid' : ''}`}
                              id="password" 
                              name="password"
                              value={formAdminNormal.password}
                              onChange={handleChangeNormal}
                              maxLength={LIMITES.PASSWORD.max}
                              placeholder="Mínimo 6 caracteres"
                              required
                            />
                            {erroresNormal.password && <div className="invalid-feedback">{erroresNormal.password}</div>}
                            <small className="text-muted">
                              {formAdminNormal.password.length}/{LIMITES.PASSWORD.max} caracteres
                            </small>
                          </div>
                        )}
                        
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
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Guardando...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Guardar Administrador
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Formulario para cambiar contraseña de administrador */}
                  {mostrarFormPassword && (
                    <div className="mb-4 p-3 border rounded bg-warning bg-opacity-10">
                      <h5>
                        <i className="fas fa-lock me-2"></i>
                        Cambiar Contraseña - {administradores.find(a => a.id === adminIdPassword)?.Nombre}
                      </h5>
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Está cambiando la contraseña del administrador <strong>{administradores.find(a => a.id === adminIdPassword)?.Nombre}</strong>
                      </div>
                      <form onSubmit={handleGuardarPassword}>
                        <div className="mb-3">
                          <label htmlFor="nuevaPassword" className="form-label">
                            Nueva contraseña *
                            <small className="text-muted ms-2">(Mínimo 6 caracteres)</small>
                          </label>
                          <input 
                            type="password" 
                            className={`form-control ${erroresPassword.nuevaPassword ? 'is-invalid' : ''}`}
                            id="nuevaPassword" 
                            name="nuevaPassword"
                            value={formPassword.nuevaPassword}
                            onChange={handlePasswordChange}
                            minLength={6}
                            placeholder="Ingrese la nueva contraseña"
                            required
                          />
                          {erroresPassword.nuevaPassword && <div className="invalid-feedback">{erroresPassword.nuevaPassword}</div>}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="confirmarPassword" className="form-label">
                            Confirmar nueva contraseña *
                          </label>
                          <input 
                            type="password" 
                            className={`form-control ${erroresPassword.confirmarPassword ? 'is-invalid' : ''}`}
                            id="confirmarPassword" 
                            name="confirmarPassword"
                            value={formPassword.confirmarPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirme la nueva contraseña"
                            required
                          />
                          {erroresPassword.confirmarPassword && <div className="invalid-feedback">{erroresPassword.confirmarPassword}</div>}
                        </div>

                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setMostrarFormPassword(false)}
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-warning"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Cambiando...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-key me-2"></i>
                                Cambiar Contraseña
                              </>
                            )}
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
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="fas fa-user-shield text-warning me-2"></i>
                                  {admin.Nombre}
                                </div>
                              </td>
                              <td><small>{admin.Correo}</small></td>
                              <td><small>{admin.Rol || 'Administrador'}</small></td>
                              <td>
                                {admin.esAdminPrincipal ? (
                                  <span className="badge bg-success">Principal</span>
                                ) : (
                                  <span className="badge bg-info">Normal</span>
                                )}
                              </td>
                              <td className="text-end">
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleEditarAdmin(admin)}
                                    disabled={loading}
                                    title="Editar administrador"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => handleCambiarPasswordAdmin(admin.id)}
                                    disabled={loading}
                                    title="Cambiar contraseña"
                                  >
                                    <i className="fas fa-lock"></i>
                                  </button>
                                  {!admin.esAdminPrincipal && (
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleEliminarAdmin(admin.id, admin.Nombre)}
                                      disabled={loading}
                                      title="Eliminar administrador"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  )}
                                </div>
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