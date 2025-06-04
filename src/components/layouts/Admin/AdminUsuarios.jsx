import React, { useState, useEffect } from 'react';
import { registrarClienteConAuth } from '../../../services/clienteFirebase';
import { obtenerUsuarios, eliminarUsuario } from '../../../services/admin/usuariosOperaciones';
import { validarFormularioCliente, formatearInput, LIMITES } from '../../../utils/validaciones';
import Swal from 'sweetalert2';

const AdminUsuarios = () => {
  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para el formulario de registro
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    direccion: '',
    comuna: '',
    telefono: ''
  });
  
  // Estado para errores de validación
  const [errores, setErrores] = useState({});
  
  // Estado para controlar carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);
  
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
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validar formulario
    const erroresValidacion = validarFormularioCliente(formData);
    
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
    
    try {
      // Adaptar los datos para mantener consistencia con la estructura de la BD
      const clienteData = {
        nombre: formData.nombre.trim(),
        email: formData.correo.trim(),
        password: formData.password,
        direccion: formData.direccion.trim(),
        comuna: formData.comuna.trim(),
        telefono: formData.telefono.trim()
      };
      
      // Usar la función registrarClienteConAuth
      await registrarClienteConAuth(clienteData);
      
      Swal.fire({
        icon: 'success',
        title: 'Cliente registrado',
        text: `El cliente ${clienteData.nombre} ha sido registrado exitosamente. Se ha enviado un correo de verificación a ${clienteData.email}. El cliente podrá hacer login una vez que verifique su email.`
      });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        correo: '',
        password: '',
        direccion: '',
        comuna: '',
        telefono: ''
      });
      
      // Limpiar errores
      setErrores({});
      
      // Recargar lista de usuarios
      fetchUsuarios();
      
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      setError(error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo registrar el cliente: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h2 className="mb-4">Gestión de Clientes</h2>
      
      <div className="row">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Registrar Nuevo Cliente
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
                
                <div className="mb-3">
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
                  {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                  <small className="text-muted">
                    {formData.correo.length}/{LIMITES.EMAIL.max} caracteres
                  </small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña *
                    <small className="text-muted ms-2">
                      ({LIMITES.PASSWORD.min}-{LIMITES.PASSWORD.max} caracteres, letras y números)
                    </small>
                  </label>
                  <input 
                    type="password" 
                    className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={LIMITES.PASSWORD.max}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                  <small className="text-muted">
                    {formData.password.length}/{LIMITES.PASSWORD.max} caracteres
                  </small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label">
                    Teléfono *
                    <small className="text-muted ms-2">
                      ({LIMITES.TELEFONO.min}-{LIMITES.TELEFONO.max} caracteres, solo números y signos)
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
                    placeholder="+56 9 1234 5678"
                    required
                  />
                  {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                  <small className="text-muted">
                    {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres
                  </small>
                </div>
                
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
                    placeholder="Calle y número"
                    required
                  />
                  {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                  <small className="text-muted">
                    {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
                  </small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="comuna" className="form-label">
                    Comuna *
                    <small className="text-muted ms-2">
                      ({LIMITES.COMUNA.min}-{LIMITES.COMUNA.max} caracteres, solo letras)
                    </small>
                  </label>
                  <input 
                    type="text" 
                    className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                    id="comuna" 
                    name="comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    maxLength={LIMITES.COMUNA.max}
                    placeholder="Nombre de la comuna"
                    required
                  />
                  {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
                  <small className="text-muted">
                    {formData.comuna.length}/{LIMITES.COMUNA.max} caracteres
                  </small>
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Registrar Cliente
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-7">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Lista de Clientes
              </h5>
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
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Comuna</th>
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
                            <small>{usuario.comuna || 'No registrada'}</small>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminarUsuario(usuario)}
                              title="Eliminar cliente"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
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
      </div>
    </div>
  );
};

export default AdminUsuarios; 