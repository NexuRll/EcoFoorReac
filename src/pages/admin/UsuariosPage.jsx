import React, { useState, useEffect } from 'react';
import { registrarClienteConAuth } from '../../services/shared/clienteFirebase';
import { obtenerUsuarios, eliminarUsuario, actualizarUsuario, obtenerUsuarioPorId } from '../../services/admin/usuariosOperaciones';
import { cambiarPasswordUsuario } from '../../services/admin/passwordOperaciones';
import { validarFormularioCliente, formatearInput, LIMITES } from '../../utils/validaciones';
import { validarEmailUnicoConDebounce } from '../../services/shared/validacionesUnicas';
import UsuariosList from '../../components/admin/usuarios/UsuariosList';
import UsuarioForm from '../../components/admin/usuarios/UsuarioForm';
import PasswordForm from '../../components/admin/usuarios/PasswordForm';
import Swal from 'sweetalert2';

const UsuariosPage = () => {
  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para controlar la vista actual
  const [vista, setVista] = useState('lista'); // 'lista', 'crear', 'editar', 'cambiarPassword'
  
  // Estado para el ID del usuario en edición
  const [usuarioIdEdicion, setUsuarioIdEdicion] = useState(null);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
  
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
          setUsuarioEnEdicion(usuario);
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
    setUsuarioEnEdicion(null);
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
    setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
  };

  // Función para manejar edición
  const handleEditarCliente = (usuarioId) => {
    setVista('editar');
    setUsuarioIdEdicion(usuarioId);
    setErrores({});
    setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
  };

  // Función para manejar cambio de contraseña
  const handleCambiarPassword = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    setVista('cambiarPassword');
    setUsuarioIdEdicion(usuarioId);
    setUsuarioEnEdicion(usuario);
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
    setUsuarioEnEdicion(null);
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

  // Manejar cambios en el formulario principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    const valorFormateado = formatearInput(name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validación de email único con debounce
    if (name === 'correo' && valorFormateado && vista === 'crear') {
      validarEmailUnicoConDebounce(valorFormateado, setValidacionEmail);
    }
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setFormPassword(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico
    if (erroresPassword[name]) {
      setErroresPassword(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejar envío del formulario principal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const erroresValidacion = validarFormularioCliente(formData, vista === 'editar');
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    // Verificar email único para creación
    if (vista === 'crear' && validacionEmail.esUnico === false) {
      setErrores({ correo: 'Este email ya está registrado' });
      return;
    }

    setLoading(true);
    
    try {
      if (vista === 'crear') {
        // Crear nuevo usuario
        const nuevoUsuario = await registrarClienteConAuth(formData);
        setUsuarios(prev => [...prev, nuevoUsuario]);
        
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          text: 'El cliente ha sido registrado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } else if (vista === 'editar') {
        // Actualizar usuario existente
        const datosActualizacion = { ...formData };
        delete datosActualizacion.password; // No actualizar contraseña aquí
        
        await actualizarUsuario(usuarioIdEdicion, datosActualizacion);
        
        // Actualizar en la lista local
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioIdEdicion 
            ? { ...u, ...datosActualizacion }
            : u
        ));
        
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'Los datos del cliente han sido actualizados.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      handleVolverALista();
    } catch (error) {
      console.error("Error al procesar usuario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al procesar la solicitud.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar envío del formulario de contraseña
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    // Validar contraseñas
    const erroresValidacion = {};
    
    if (!formPassword.nuevaPassword) {
      erroresValidacion.nuevaPassword = 'La nueva contraseña es requerida';
    } else if (formPassword.nuevaPassword.length < 6) {
      erroresValidacion.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formPassword.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Debe confirmar la contraseña';
    } else if (formPassword.nuevaPassword !== formPassword.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErroresPassword(erroresValidacion);
      return;
    }

    setLoading(true);
    
    try {
      await cambiarPasswordUsuario(usuarioIdEdicion, formPassword.nuevaPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'La contraseña ha sido cambiada exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });
      
      handleVolverALista();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Inténtelo nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar según la vista actual
  const renderContent = () => {
    switch (vista) {
      case 'crear':
        return (
          <UsuarioForm
            formData={formData}
            errores={errores}
            loading={loading}
            isEditing={false}
            validacionEmail={validacionEmail}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleVolverALista}
          />
        );
      
      case 'editar':
        return (
          <UsuarioForm
            formData={formData}
            errores={errores}
            loading={loading}
            isEditing={true}
            validacionEmail={validacionEmail}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleVolverALista}
          />
        );
      
      case 'cambiarPassword':
        return (
          <PasswordForm
            formPassword={formPassword}
            errores={erroresPassword}
            loading={loading}
            usuarioNombre={usuarioEnEdicion?.nombre}
            onChange={handlePasswordChange}
            onSubmit={handleSubmitPassword}
            onCancel={handleVolverALista}
          />
        );
      
      default:
        return (
          <UsuariosList
            usuarios={usuarios}
            loading={loadingUsers}
            onEditar={handleEditarCliente}
            onEliminar={handleEliminarUsuario}
            onCambiarPassword={handleCambiarPassword}
            onNuevoUsuario={handleNuevoCliente}
          />
        );
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <i className="fas fa-home me-1"></i>
                Admin
              </li>
              <li className="breadcrumb-item active">
                Gestión de Clientes
              </li>
              {vista !== 'lista' && (
                <li className="breadcrumb-item active">
                  {vista === 'crear' ? 'Nuevo Cliente' : 
                   vista === 'editar' ? 'Editar Cliente' : 'Cambiar Contraseña'}
                </li>
              )}
            </ol>
          </nav>

          {/* Contenido principal */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage; 