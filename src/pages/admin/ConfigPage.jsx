import React, { useState, useEffect } from 'react';
import { 
  obtenerAdminPrincipal, 
  existeAdminPrincipal, 
  ADMIN_PRINCIPAL_UID 
} from '../../services/admin';
import { 
  registrarAdministradorConAuth,
  actualizarAdministradorConAuth,
  eliminarAdministradorConAuth,
  obtenerTodosLosAdministradores
} from '../../services/admin/adminFirebase';
import { validarFormularioAdmin, formatearInput, LIMITES } from '../../utils/validaciones';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/core/firebase';
import Swal from 'sweetalert2';

// Componentes modulares
import AdminList from '../../components/admin/administradores/AdminList';
import AdminForm from '../../components/admin/administradores/AdminForm';
import AdminPasswordForm from '../../components/admin/administradores/AdminPasswordForm';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';

const ConfigPage = () => {
  // Estados principales
  const [adminPrincipal, setAdminPrincipal] = useState(null);
  const [existe, setExiste] = useState(false);
  const [loading, setLoading] = useState(true);
  const [administradores, setAdministradores] = useState([]);
  
  // Estados de UI
  const [modoEdicion, setModoEdicion] = useState(false);
  const [adminIdEdicion, setAdminIdEdicion] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormPassword, setMostrarFormPassword] = useState(false);
  const [adminIdPassword, setAdminIdPassword] = useState(null);
  
  // Estados de formularios
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    contraseña: '',
    Rol: 'admin'
  });
  
  const [formAdminNormal, setFormAdminNormal] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'admin'
  });

  const [formPassword, setFormPassword] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  
  // Estados de errores
  const [erroresPrincipal, setErroresPrincipal] = useState({});
  const [erroresNormal, setErroresNormal] = useState({});
  const [erroresPassword, setErroresPassword] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

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

  // Handlers para Admin Principal
  const handleChangePrincipal = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    if (name === 'Nombre') {
      valorFormateado = formatearInput(value, 'nombre');
    } else if (name === 'Correo') {
      valorFormateado = formatearInput(value, 'email');
    }
    
    const limite = LIMITES[name === 'Nombre' ? 'NOMBRE' : name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    if (erroresPrincipal[name]) {
      setErroresPrincipal(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmitPrincipal = async (e) => {
    e.preventDefault();
    
    const datosParaValidar = {
      nombre: formData.Nombre,
      email: formData.Correo,
      password: formData.contraseña
    };
    
    const erroresValidacion = validarFormularioAdmin(datosParaValidar);
    
    if (Object.keys(erroresValidacion).length > 0) {
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
      
      const adminExiste = await existeAdminPrincipal();
      if (adminExiste) {
        Swal.fire({
          icon: 'warning',
          title: 'Administrador ya existe',
          text: 'Ya existe un administrador principal configurado'
        });
        return;
      }
      
      await setDoc(doc(db, "Administrador", ADMIN_PRINCIPAL_UID), {
        ...formData,
        FechaCreacion: new Date().toISOString(),
        esAdminPrincipal: true
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Administrador Principal Creado',
        text: 'El administrador principal ha sido configurado correctamente.'
      });
      
      // Recargar datos
      await cargarDatos();
      
      // Limpiar formulario
      setFormData({
        Nombre: '',
        Correo: '',
        contraseña: '',
        Rol: 'admin'
      });
      setErroresPrincipal({});
      
    } catch (error) {
      console.error("Error al crear administrador principal:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo crear el administrador: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Administradores Normales
  const handleChangeNormal = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    if (name === 'nombre') {
      valorFormateado = formatearInput(value, 'nombre');
    } else if (name === 'email') {
      valorFormateado = formatearInput(value, 'email');
    }
    
    const limite = LIMITES[name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormAdminNormal(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    if (erroresNormal[name]) {
      setErroresNormal(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmitNormal = async (e) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormularioAdmin(formAdminNormal, modoEdicion);
    
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
        await actualizarAdministradorConAuth(adminIdEdicion, formAdminNormal);
        Swal.fire({
          icon: 'success',
          title: 'Administrador Actualizado',
          text: 'Los datos del administrador han sido actualizados correctamente.'
        });
      } else {
        await registrarAdministradorConAuth(formAdminNormal);
        Swal.fire({
          icon: 'success',
          title: 'Administrador Creado',
          text: 'El nuevo administrador ha sido creado correctamente.'
        });
      }
      
      // Recargar datos y limpiar formulario
      await cargarDatos();
      handleCancelarFormulario();
      
    } catch (error) {
      console.error("Error al guardar administrador:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el administrador.'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditarAdmin = (admin) => {
    setModoEdicion(true);
    setAdminIdEdicion(admin.id);
    setFormAdminNormal({
      nombre: admin.Nombre || admin.nombre,
      email: admin.Correo || admin.email,
      password: '',
      rol: admin.Rol || admin.rol || 'admin'
    });
    setErroresNormal({});
    setMostrarFormulario(true);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setAdminIdEdicion(null);
    setFormAdminNormal({
      nombre: '',
      email: '',
      password: '',
      rol: 'admin'
    });
    setErroresNormal({});
  };

  // Handlers para cambio de contraseña
  const handleCambiarPassword = (adminId) => {
    setAdminIdPassword(adminId);
    setFormPassword({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErroresPassword({});
    setMostrarFormPassword(true);
  };

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

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    const errores = {};
    
    if (!formPassword.nuevaPassword || formPassword.nuevaPassword.length < 6) {
      errores.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formPassword.confirmarPassword) {
      errores.confirmarPassword = 'Debe confirmar la contraseña';
    } else if (formPassword.nuevaPassword !== formPassword.confirmarPassword) {
      errores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(errores).length > 0) {
      setErroresPassword(errores);
      return;
    }

    try {
      setLoading(true);
      
      const admin = administradores.find(a => a.id === adminIdPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: `La contraseña del administrador ${admin?.Nombre} ha sido cambiada correctamente.`
      });

      handleCancelarPassword();
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

  const handleCancelarPassword = () => {
    setMostrarFormPassword(false);
    setAdminIdPassword(null);
    setFormPassword({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErroresPassword({});
  };

  const handleEliminarAdmin = async (adminId, nombre) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al administrador ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarAdministradorConAuth(adminId);
        await cargarDatos();
        
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
  };

  if (loading && !existe && administradores.length === 0) {
    return (
      <div className="container">
        <LoadingSpinner text="Cargando configuración de administradores..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-cogs me-2"></i>
          Configuración de Administradores
        </h2>
        <div className="text-muted">
          <small>
            <i className="fas fa-users me-1"></i>
            {administradores.length} administrador{administradores.length !== 1 ? 'es' : ''}
          </small>
        </div>
      </div>
      
      <div className="row">
        {/* Administrador Principal */}
        <div className="col-12 mb-4">
          {existe && adminPrincipal ? (
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-crown me-2"></i>
                  Administrador Principal
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  El administrador principal no puede ser eliminado y tiene acceso completo al sistema.
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>ID:</strong> <code>{adminPrincipal.id}</code></p>
                    <p><strong>Nombre:</strong> {adminPrincipal.Nombre}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Correo:</strong> {adminPrincipal.Correo}</p>
                    <p><strong>Rol:</strong> 
                      <span className="badge bg-success ms-2">
                        {adminPrincipal.Rol || 'Administrador Principal'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <AdminForm
              formData={formData}
              errores={erroresPrincipal}
              loading={loading}
              isPrincipal={true}
              onChange={handleChangePrincipal}
              onSubmit={handleSubmitPrincipal}
            />
          )}
        </div>
        
        {/* Gestión de Administradores */}
        {existe && (
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-users-cog me-2"></i>
                  Gestión de Administradores
                </h5>
                <button 
                  className="btn btn-light btn-sm" 
                  onClick={handleNuevoAdmin}
                  disabled={loading}
                >
                  <i className="fas fa-plus me-1"></i> 
                  Nuevo Administrador
                </button>
              </div>
              <div className="card-body">
                {/* Formulario para crear/editar administrador */}
                {mostrarFormulario && (
                  <div className="mb-4">
                    <AdminForm
                      formData={formAdminNormal}
                      errores={erroresNormal}
                      loading={loading}
                      isEditing={modoEdicion}
                      onChange={handleChangeNormal}
                      onSubmit={handleSubmitNormal}
                      onCancel={handleCancelarFormulario}
                    />
                  </div>
                )}

                {/* Formulario para cambiar contraseña */}
                {mostrarFormPassword && (
                  <div className="mb-4">
                    <AdminPasswordForm
                      formPassword={formPassword}
                      errores={erroresPassword}
                      loading={loading}
                      adminNombre={administradores.find(a => a.id === adminIdPassword)?.Nombre}
                      onChange={handlePasswordChange}
                      onSubmit={handleSubmitPassword}
                      onCancel={handleCancelarPassword}
                    />
                  </div>
                )}
                
                {/* Lista de administradores */}
                <AdminList
                  administradores={administradores}
                  loading={loading}
                  onEditar={handleEditarAdmin}
                  onCambiarPassword={handleCambiarPassword}
                  onEliminar={handleEliminarAdmin}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPage; 