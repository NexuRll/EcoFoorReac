import React, { useState, useEffect } from 'react';
import { registrarClienteConAuth } from '../../../services/clienteFirebase';
import { obtenerUsuarios, eliminarUsuario } from '../../../services/admin/usuariosOperaciones';
import Swal from 'sweetalert2';

const AdminUsuarios = () => {
  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para el formulario de registro
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',  // Cambio a correo para mantener consistencia con la BD
    password: '',
    direccion: '',
    comuna: '',
    telefono: ''  // Añadido teléfono
  });
  
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
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Adaptar los datos para mantener consistencia con la estructura de la BD
      const clienteData = {
        nombre: formData.nombre,
        email: formData.correo,
        password: formData.password,
        direccion: formData.direccion,
        comuna: formData.comuna,
        telefono: formData.telefono
      };
      
      // Usar la función registrarClienteConAuth
      await registrarClienteConAuth(clienteData);
      
      Swal.fire({
        icon: 'success',
        title: 'Cliente registrado',
        text: 'El cliente ha sido registrado exitosamente'
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
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Registrar Nuevo Cliente</h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="nombre" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="correo" className="form-label">Correo electrónico</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="correo" 
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label">Dirección</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="direccion" 
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="comuna" className="form-label">Comuna</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="comuna" 
                    name="comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="telefono" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : (
                    'Registrar Cliente'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-7">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Lista de Clientes</h5>
            </div>
            <div className="card-body">
              {loadingUsers ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando clientes...</p>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="alert alert-info">
                  No hay clientes registrados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Comuna</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.correo}</td>
                          <td>{usuario.telefono}</td>
                          <td>{usuario.direccion}</td>
                          <td>{usuario.comuna}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminarUsuario(usuario)}
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