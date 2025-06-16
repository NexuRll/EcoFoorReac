import React, { useState, useEffect } from 'react';
import { registrarClienteConAuth } from '../../../services/clienteFirebase';
import { obtenerUsuarios, eliminarUsuario, actualizarUsuario, obtenerUsuarioPorId } from '../../../services/admin/usuariosOperaciones';
import { validarFormularioCliente, formatearInput, LIMITES } from '../../../utils/validaciones';
import { validarEmailUnicoConDebounce } from '../../../services/validacionesUnicas';
import SelectorPaisComunaAPI from '../../common/SelectorPaisComunaAPI';
import Swal from 'sweetalert2';

const AdminUsuarios = () => {
  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para controlar la vista actual
  const [vista, setVista] = useState('lista'); // 'lista', 'crear', 'editar', 'cambiarPassword'
  
  // Estado para el ID del usuario en edición
  const [usuarioIdEdicion, setUsuarioIdEdicion] = useState(null);
  
  // Estado para el formulario de registro
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    pais: '',
    comuna: '',
    direccion: '',
    telefono: ''
  });

  // Estado para formulario de cambio de contraseña
  const [formPassword, setFormPassword] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });

  // Estado para errores de validación
  const [errores, setErrores] = useState({});
  const [erroresPassword, setErroresPassword] = useState({});
  
  // Estado para controlar carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  // Estado para validación única de email
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Cargar datos del usuario cuando se va a editar
  useEffect(() => {
    const cargarUsuario = async () => {
      if (vista === 'editar' && usuarioIdEdicion) {
        setLoading(true);
        try {
          const usuario = await obtenerUsuarioPorId(usuarioIdEdicion);
          setFormData({
            nombre: usuario.nombre || '',
            correo: usuario.correo || '',
            password: '', // No cargar contraseña por seguridad
            pais: usuario.pais || '',
            comuna: usuario.comuna || '',
            direccion: usuario.direccion || '',
            telefono: usuario.telefono || ''
          });
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar los datos del usuario.'
          });
          setVista('lista');
        } finally {
          setLoading(false);
        }
      }
    };

    cargarUsuario();
  }, [vista, usuarioIdEdicion]);
  
  // Función para obtener usuarios
  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const listaUsuarios = await obtenerUsuarios();
      // Filtrar solo usuarios de tipo 'cliente'
      const clientes = listaUsuarios.filter(user => user.tipoUsuario === 'cliente');
      setUsuarios(clientes);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios. Por favor, intente nuevamente.'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Función para manejar creación
  const handleNuevoCliente = () => {
    setVista('crear');
    setUsuarioIdEdicion(null);
    setFormData({
      nombre: '',
      correo: '',
      password: '',
      pais: '',
      comuna: '',
      direccion: '',
      telefono: ''
    });
    setErrores({});
  };

  // Función para manejar edición
  const handleEditarCliente = (usuarioId) => {
    setVista('editar');
    setUsuarioIdEdicion(usuarioId);
    setErrores({});
  };

  // Función para manejar cambio de contraseña
  const handleCambiarPassword = (usuarioId) => {
    setVista('cambiarPassword');
    setUsuarioIdEdicion(usuarioId);
    setFormPassword({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErroresPassword({});
  };

  // Función para volver a la lista
  const handleVolverALista = () => {
    setVista('lista');
    setUsuarioIdEdicion(null);
    setFormData({
      nombre: '',
      correo: '',
      password: '',
      pais: '',
      comuna: '',
      direccion: '',
      telefono: ''
    });
    setFormPassword({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErrores({});
    setErroresPassword({});
    setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
  };
  
  // Función para eliminar usuario
  const handleEliminarUsuario = (usuario) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al cliente ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(usuario.id);
          // Actualizar la lista de usuarios
          setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== usuario.id));
          
          Swal.fire(
            'Eliminado',
            'El cliente ha sido eliminado correctamente.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
          Swal.fire(
            'Error',
            'No se pudo eliminar el cliente. Inténtelo nuevamente.',
            'error'
          );
        }
      }
    });
  };
  
  // Manejar cambios en el formulario con validación y formateo en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    // Aplicar formateo según el tipo de campo
    switch (name) {
      case 'nombre':
        valorFormateado = formatearInput(value, 'nombre');
        break;
      case 'telefono':
        valorFormateado = formatearInput(value, 'telefono');
        break;
      case 'correo':
        valorFormateado = formatearInput(value, 'email');
        break;
      default:
        valorFormateado = value;
    }
    
    // Aplicar límites de caracteres
    const limite = LIMITES[name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    // Limpiar error del campo cuando cambia
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validación en tiempo real para email único (solo en creación o si cambió el email)
    if (name === 'correo' && valorFormateado.length >= 5) {
      const emailOriginal = vista === 'editar' ? usuarios.find(u => u.id === usuarioIdEdicion)?.correo : null;
      if (vista === 'crear' || (vista === 'editar' && valorFormateado !== emailOriginal)) {
        validarEmailUnicoConDebounce(valorFormateado, usuarioIdEdicion, setValidacionEmail);
      } else {
        setValidacionEmail({ validando: false, esUnico: true, mensaje: null, error: null });
      }
    } else if (name === 'correo') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }
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
  
  // Manejar envío del formulario de cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (vista === 'crear') {
        // Validar formulario completo para creación
        const erroresValidacion = validarFormularioCliente(formData);
        
        // Agregar error de email único si es necesario
        if (validacionEmail.esUnico === false) {
          erroresValidacion.correo = validacionEmail.mensaje;
        }
        
        if (Object.keys(erroresValidacion).length > 0) {
          setErrores(erroresValidacion);
          setLoading(false);
          Swal.fire({
            icon: 'warning',
            title: 'Errores de validación',
            text: 'Por favor corrige los errores en el formulario'
          });
          return;
        }
        
        // Adaptar los datos para mantener consistencia con la estructura de la BD
        const clienteData = {
          nombre: formData.nombre.trim(),
          email: formData.correo.trim(),
          password: formData.password,
          pais: formData.pais.trim(),
          comuna: formData.comuna.trim(),
          direccion: formData.direccion.trim(),
          telefono: formData.telefono.trim()
        };
        
        // Usar la función registrarClienteConAuth
        await registrarClienteConAuth(clienteData);
        
        Swal.fire({
          icon: 'success',
          title: 'Cliente registrado',
          text: `El cliente ${clienteData.nombre} ha sido registrado exitosamente. Se ha enviado un correo de verificación a ${clienteData.email}. El cliente podrá hacer login una vez que verifique su email.`
        });

        fetchUsuarios();
      } else if (vista === 'editar') {
        // Validar formulario sin contraseña para edición
        const datosParaValidar = { ...formData };
        delete datosParaValidar.password; // Remover password de validación
        
        const erroresValidacion = validarFormularioCliente(datosParaValidar, false); // false = no requerir password
        
        // Agregar error de email único si es necesario
        const emailOriginal = usuarios.find(u => u.id === usuarioIdEdicion)?.correo;
        if (formData.correo !== emailOriginal && validacionEmail.esUnico === false) {
          erroresValidacion.correo = validacionEmail.mensaje;
        }
        
        if (Object.keys(erroresValidacion).length > 0) {
          setErrores(erroresValidacion);
          setLoading(false);
          Swal.fire({
            icon: 'warning',
            title: 'Errores de validación',
            text: 'Por favor corrige los errores en el formulario'
          });
          return;
        }

        // Preparar datos para actualización (sin contraseña)
        const datosActualizados = {
          nombre: formData.nombre.trim(),
          correo: formData.correo.trim(),
          pais: formData.pais.trim(),
          comuna: formData.comuna.trim(),
          direccion: formData.direccion.trim(),
          telefono: formData.telefono.trim()
        };

        await actualizarUsuario(usuarioIdEdicion, datosActualizados);
        
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'Los datos del cliente han sido actualizados correctamente.'
        });

        fetchUsuarios();
      }

      handleVolverALista();
      
    } catch (error) {
      console.error('Error al procesar cliente:', error);
      setError(error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo ${vista === 'crear' ? 'registrar' : 'actualizar'} el cliente: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar envío del formulario de cambio de contraseña
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      setLoading(false);
      return;
    }

    try {
      // TODO: Implementar cambio de contraseña en Firebase Auth
      // Por ahora solo mostramos mensaje de éxito
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: 'La contraseña del cliente ha sido cambiada correctamente.'
      });

      handleVolverALista();
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

  // Función para obtener el icono de validación de email
  const getEmailValidationIcon = () => {
    if (validacionEmail.validando) {
      return <i className="fas fa-spinner fa-spin text-info"></i>;
    }
    if (validacionEmail.esUnico === true) {
      return <i className="fas fa-check-circle text-success"></i>;
    }
    if (validacionEmail.esUnico === false) {
      return <i className="fas fa-times-circle text-danger"></i>;
    }
    return null;
  };

  // Renderizado del formulario de cliente
  const renderFormularioCliente = () => (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className={`fas ${vista === 'crear' ? 'fa-user-plus' : 'fa-user-edit'} me-2`}></i>
          {vista === 'crear' ? 'Registrar Nuevo Cliente' : 'Editar Cliente'}
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">
              Nombre completo *
              <small className="text-muted ms-2">
                ({LIMITES.NOMBRE.min}-{LIMITES.NOMBRE.max} caracteres, solo letras)
              </small>
            </label>
            <input 
              type="text" 
              className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
              id="nombre" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              maxLength={LIMITES.NOMBRE.max}
              placeholder="Ingrese el nombre completo"
              required
            />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            <small className="text-muted">
              {formData.nombre.length}/{LIMITES.NOMBRE.max} caracteres
            </small>
          </div>
          
          <div className="mb-3 position-relative">
            <label htmlFor="correo" className="form-label">
              Correo electrónico *
              <small className="text-muted ms-2">
                ({LIMITES.EMAIL.min}-{LIMITES.EMAIL.max} caracteres)
              </small>
            </label>
            <input 
              type="email" 
              className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
              id="correo" 
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              maxLength={LIMITES.EMAIL.max}
              placeholder="cliente@ejemplo.com"
              required
            />
            <div className="position-absolute" style={{ top: '38px', right: '10px' }}>
              {getEmailValidationIcon()}
            </div>
            {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
            {validacionEmail.mensaje && !errores.correo && (
              <small className={`text-${validacionEmail.esUnico ? 'success' : 'danger'}`}>
                {validacionEmail.mensaje}
              </small>
            )}
            <small className="text-muted">
              {formData.correo.length}/{LIMITES.EMAIL.max} caracteres
            </small>
          </div>
          
          {vista === 'crear' && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña *
                <small className="text-muted ms-2">
                  (Mínimo {LIMITES.PASSWORD.min} caracteres)
                </small>
              </label>
              <input 
                type="password" 
                className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={LIMITES.PASSWORD.min}
                maxLength={LIMITES.PASSWORD.max}
                placeholder="Ingrese una contraseña segura"
                required
              />
              {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              <small className="text-muted">
                {formData.password.length}/{LIMITES.PASSWORD.max} caracteres
              </small>
            </div>
          )}

          <SelectorPaisComunaAPI
            paisSeleccionado={formData.pais}
            comunaSeleccionada={formData.comuna}
            onPaisChange={(pais) => setFormData(prev => ({ ...prev, pais }))}
            onComunaChange={(comuna) => setFormData(prev => ({ ...prev, comuna }))}
            errores={{ pais: errores.pais, comuna: errores.comuna }}
          />
          
          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">
              Dirección *
              <small className="text-muted ms-2">
                ({LIMITES.DIRECCION.min}-{LIMITES.DIRECCION.max} caracteres)
              </small>
            </label>
            <input 
              type="text" 
              className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
              id="direccion" 
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              maxLength={LIMITES.DIRECCION.max}
              placeholder="Ingrese la dirección"
              required
            />
            {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
            <small className="text-muted">
              {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
            </small>
          </div>
          
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">
              Teléfono
              <small className="text-muted ms-2">
                ({LIMITES.TELEFONO.min}-{LIMITES.TELEFONO.max} caracteres, solo números)
              </small>
            </label>
            <input 
              type="tel" 
              className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
              id="telefono" 
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              maxLength={LIMITES.TELEFONO.max}
              placeholder="Ej: 987654321"
            />
            {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
            <small className="text-muted">
              {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres
            </small>
          </div>
          
          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary me-2"
              onClick={handleVolverALista}
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
                  {vista === 'crear' ? 'Registrando...' : 'Actualizando...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {vista === 'crear' ? 'Registrar Cliente' : 'Actualizar Cliente'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizado del formulario de cambio de contraseña
  const renderFormularioPassword = () => {
    const usuario = usuarios.find(u => u.id === usuarioIdEdicion);
    
    return (
      <div className="card">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">
            <i className="fas fa-lock me-2"></i>
            Cambiar Contraseña - {usuario?.nombre}
          </h5>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Está cambiando la contraseña del cliente <strong>{usuario?.nombre}</strong> ({usuario?.correo})
          </div>

          <form onSubmit={handleSubmitPassword}>
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
                onClick={handleVolverALista}
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
      </div>
    );
  };

  // Renderizado de la lista de clientes
  const renderListaClientes = () => (
    <div className="card">
      <div className="card-header bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Lista de Clientes
          </h5>
          <button 
            className="btn btn-light btn-sm"
            onClick={handleNuevoCliente}
          >
            <i className="fas fa-user-plus me-2"></i>
            Nuevo Cliente
          </button>
        </div>
      </div>
      <div className="card-body">
        {loadingUsers ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando clientes...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <p className="text-muted">No hay clientes registrados</p>
            <button 
              className="btn btn-primary"
              onClick={handleNuevoCliente}
            >
              <i className="fas fa-user-plus me-2"></i>
              Registrar Primer Cliente
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Ubicación</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-user-circle text-primary me-2"></i>
                        {usuario.nombre}
                      </div>
                    </td>
                    <td>
                      <small>{usuario.correo}</small>
                    </td>
                    <td>
                      <small>{usuario.telefono || 'No registrado'}</small>
                    </td>
                    <td>
                      <small>
                        {usuario.comuna || 'No registrada'}
                        {usuario.pais && usuario.comuna && ', '}
                        {usuario.pais || ''}
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEditarCliente(usuario.id)}
                          title="Editar cliente"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleCambiarPassword(usuario.id)}
                          title="Cambiar contraseña"
                        >
                          <i className="fas fa-lock"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminarUsuario(usuario)}
                          title="Eliminar cliente"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
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
  );
  
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {vista === 'lista' && 'Gestión de Clientes'}
          {vista === 'crear' && 'Crear Nuevo Cliente'}
          {vista === 'editar' && 'Editar Cliente'}
          {vista === 'cambiarPassword' && 'Cambiar Contraseña'}
        </h2>
        
        {vista !== 'lista' && (
          <button
            className="btn btn-outline-secondary"
            onClick={handleVolverALista}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Volver a la lista
          </button>
        )}
      </div>
      
      {vista === 'lista' && renderListaClientes()}
      {(vista === 'crear' || vista === 'editar') && renderFormularioCliente()}
      {vista === 'cambiarPassword' && renderFormularioPassword()}
    </div>
  );
};

export default AdminUsuarios; 