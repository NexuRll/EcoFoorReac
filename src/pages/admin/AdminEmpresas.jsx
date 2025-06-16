import React, { useState, useEffect } from 'react';
import { 
  obtenerTodasLasEmpresas, 
  registrarEmpresaConAuth, 
  actualizarEmpresa, 
  eliminarEmpresa, 
  cambiarEstadoEmpresa,
  obtenerEmpresaPorId
} from '../../services/empresa/empresaFirebase';
import { cambiarPasswordEmpresa, validarPassword } from '../../services/admin/passwordOperaciones';
import { validarFormularioEmpresa, formatearInput, LIMITES } from '../../utils/validaciones';
import EmpresasList from '../../components/admin/empresas/EmpresasList';
import EmpresaForm from '../../components/admin/empresas/EmpresaForm';
import EmpresaFormTest from '../../components/admin/empresas/EmpresaFormTest';
import PasswordChangeModal from '../../components/admin/usuarios/PasswordChangeModal';
import Swal from 'sweetalert2';

const AdminEmpresas = () => {
  // Estados principales
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // Estados de UI
  const [vista, setVista] = useState('lista'); // 'lista', 'crear', 'editar', 'prueba'
  const [empresaIdEdicion, setEmpresaIdEdicion] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [empresaPassword, setEmpresaPassword] = useState(null);
  
  // Estados de formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rut: '',
    telefono: '',
    direccion: '',
    comuna: '',
    password: '',
    activa: true
  });
  
  const [errores, setErrores] = useState({});

  // Cargar empresas al montar el componente
  useEffect(() => {
    cargarEmpresas();
  }, []);

  // Cargar datos de empresa para edición
  useEffect(() => {
    const cargarEmpresa = async () => {
      if (vista === 'editar' && empresaIdEdicion) {
        setLoadingForm(true);
        try {
          const empresa = await obtenerEmpresaPorId(empresaIdEdicion);
          setFormData({
            nombre: empresa.nombre || '',
            email: empresa.email || '',
            rut: empresa.rut || '',
            telefono: empresa.telefono || '',
            direccion: empresa.direccion || '',
            comuna: empresa.comuna || '',
            password: '', // No cargar contraseña por seguridad
            activa: empresa.activa !== undefined ? empresa.activa : true
          });
        } catch (error) {
          console.error("Error al cargar empresa:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar los datos de la empresa.'
          });
          setVista('lista');
        } finally {
          setLoadingForm(false);
        }
      }
    };

    cargarEmpresa();
  }, [vista, empresaIdEdicion]);

  // Función para cargar todas las empresas
  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const listaEmpresas = await obtenerTodasLasEmpresas();
      setEmpresas(listaEmpresas);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las empresas. Por favor, intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers de navegación
  const handleNuevaEmpresa = () => {
    setVista('crear');
    setEmpresaIdEdicion(null);
    setFormData({
      nombre: '',
      email: '',
      rut: '',
      telefono: '',
      direccion: '',
      comuna: '',
      password: '',
      activa: true
    });
    setErrores({});
  };

  const handleEditarEmpresa = (empresaId) => {
    setVista('editar');
    setEmpresaIdEdicion(empresaId);
    setErrores({});
  };

  const handleVolverALista = () => {
    setVista('lista');
    setEmpresaIdEdicion(null);
    setFormData({
      nombre: '',
      email: '',
      rut: '',
      telefono: '',
      direccion: '',
      comuna: '',
      password: '',
      activa: true
    });
    setErrores({});
  };

  // Handler para cambio de contraseña
  const handleCambiarPassword = (empresa) => {
    setEmpresaPassword(empresa);
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (empresaId, nuevaPassword) => {
    setLoadingPassword(true);
    try {
      // Validar la nueva contraseña
      validarPassword(nuevaPassword);
      
      // Cambiar la contraseña
      await cambiarPasswordEmpresa(empresaId, nuevaPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: `La contraseña de ${empresaPassword.nombre} ha sido actualizada correctamente.`
      });
      
      setShowPasswordModal(false);
      setEmpresaPassword(null);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cambiar la contraseña. Intente nuevamente.'
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  // Handler para cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valorFormateado = type === 'checkbox' ? checked : value;
    
    // Formatear según el tipo de campo
    if (type !== 'checkbox') {
      if (name === 'nombre') {
        valorFormateado = formatearInput(value, 'nombre');
      } else if (name === 'email') {
        valorFormateado = formatearInput(value, 'email');
      } else if (name === 'rut') {
        valorFormateado = formatearInput(value, 'rut');
      } else if (name === 'telefono') {
        valorFormateado = formatearInput(value, 'telefono');
      }
      
      // Aplicar límites de caracteres
      const limite = LIMITES[name.toUpperCase()] || LIMITES.EMPRESA_NOMBRE;
      if (limite && valorFormateado.length > limite.max) {
        valorFormateado = valorFormateado.substring(0, limite.max);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado
    }));
    
    // Limpiar error del campo si existe
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handler para envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const erroresValidacion = validarFormularioEmpresa(formData, vista === 'crear');
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        text: 'Por favor corrige los errores en el formulario'
      });
      return;
    }
    
    setLoadingForm(true);
    
    try {
      if (vista === 'crear') {
        // Crear nueva empresa
        await registrarEmpresaConAuth(formData);
        
        Swal.fire({
          icon: 'success',
          title: 'Empresa registrada',
          text: 'La empresa ha sido registrada correctamente. Se ha enviado un email de verificación.'
        });
      } else if (vista === 'editar') {
        // Actualizar empresa existente
        const datosActualizacion = { ...formData };
        delete datosActualizacion.password; // No actualizar contraseña
        delete datosActualizacion.email; // No actualizar email
        delete datosActualizacion.rut; // No actualizar RUT
        
        await actualizarEmpresa(empresaIdEdicion, datosActualizacion);
        
        Swal.fire({
          icon: 'success',
          title: 'Empresa actualizada',
          text: 'Los datos de la empresa han sido actualizados correctamente.'
        });
      }
      
      // Recargar lista y volver a la vista principal
      await cargarEmpresas();
      handleVolverALista();
      
    } catch (error) {
      console.error("Error al procesar empresa:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo procesar la empresa. Intente nuevamente.'
      });
    } finally {
      setLoadingForm(false);
    }
  };

  // Handler para eliminar empresa
  const handleEliminarEmpresa = (empresa) => {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>¿Deseas eliminar la empresa <strong>${empresa.nombre}</strong>?</p>
        <p class="text-danger"><small>Esta acción no se puede deshacer.</small></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarEmpresa(empresa.id);
          
          // Actualizar la lista local
          setEmpresas(prevEmpresas => prevEmpresas.filter(e => e.id !== empresa.id));
          
          Swal.fire(
            'Eliminada',
            'La empresa ha sido eliminada correctamente.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar empresa:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la empresa. Intente nuevamente.'
          });
        }
      }
    });
  };

  // Handler para cambiar estado de empresa
  const handleCambiarEstado = async (empresaId, nuevoEstado) => {
    const empresa = empresas.find(e => e.id === empresaId);
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    try {
      const result = await Swal.fire({
        title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} empresa?`,
        text: `¿Deseas ${accion} la empresa "${empresa.nombre}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: nuevoEstado ? '#28a745' : '#ffc107',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Sí, ${accion}`,
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await cambiarEstadoEmpresa(empresaId, nuevoEstado);
        
        // Actualizar la lista local
        setEmpresas(prevEmpresas => 
          prevEmpresas.map(e => 
            e.id === empresaId ? { ...e, activa: nuevoEstado } : e
          )
        );
        
        Swal.fire(
          `Empresa ${nuevoEstado ? 'activada' : 'desactivada'}`,
          `La empresa ha sido ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`,
          'success'
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado de empresa:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo ${accion} la empresa. Intente nuevamente.`
      });
    }
  };

  // Renderizar contenido según la vista actual
  const renderContent = () => {
    switch (vista) {
      case 'crear':
      case 'editar':
        return (
          <EmpresaForm
            formData={formData}
            errores={errores}
            loading={loadingForm}
            modoEdicion={vista === 'editar'}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onCancelar={handleVolverALista}
          />
        );
      
      case 'prueba':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>🧪 Modo de Prueba - Diagnóstico</h4>
              <button 
                className="btn btn-secondary"
                onClick={() => setVista('lista')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver a Lista
              </button>
            </div>
            <EmpresaFormTest />
          </div>
        );
      
      default:
        return (
          <div>
            {/* Botón temporal para acceder al modo de prueba */}
            <div className="alert alert-warning mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>🧪 Modo de Diagnóstico Disponible</strong>
                  <p className="mb-0">Si tienes problemas registrando empresas, usa el formulario de prueba para diagnosticar el problema.</p>
                </div>
                <button 
                  className="btn btn-warning"
                  onClick={() => setVista('prueba')}
                >
                  🧪 Abrir Prueba
                </button>
              </div>
            </div>
            
            <EmpresasList
              empresas={empresas}
              loading={loading}
              onEditar={handleEditarEmpresa}
              onEliminar={handleEliminarEmpresa}
              onCambiarEstado={handleCambiarEstado}
              onCambiarPassword={handleCambiarPassword}
              onNuevaEmpresa={handleNuevaEmpresa}
            />
          </div>
        );
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {renderContent()}
        </div>
      </div>
      
      {/* Modal para cambio de contraseña */}
      <PasswordChangeModal
        show={showPasswordModal}
        onHide={() => {
          setShowPasswordModal(false);
          setEmpresaPassword(null);
        }}
        usuario={empresaPassword}
        onChangePassword={handlePasswordChange}
        loading={loadingPassword}
      />
    </div>
  );
};

export default AdminEmpresas; 