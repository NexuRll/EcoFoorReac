import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarPerfilAdmin } from '../../services/admin/adminOperaciones';
import { validarEmailUnicoConDebounce } from '../../services/shared/validacionesUnicas';
import { validarNombre, validarEmail, formatearInput, LIMITES } from '../../utils/validaciones';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import Swal from 'sweetalert2';

const PerfilAdmin = () => {
  const { userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    telefono: ''
  });
  const [errores, setErrores] = useState({});

  // Estado para validación única de email
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });

  // Estado para prevenir sobrescritura de datos recién guardados
  const [datosActualizadosRecientemente, setDatosActualizadosRecientemente] = useState(false);

  // Cargar datos del administrador al montar el componente
  useEffect(() => {
    console.log('userData cambió en PerfilAdmin:', userData);
    
    // Si acabamos de actualizar los datos, no sobrescribir
    if (datosActualizadosRecientemente) {
      console.log('Datos fueron actualizados recientemente, evitando sobrescritura');
      // No resetear inmediatamente, esperar un poco más
      setTimeout(() => {
        setDatosActualizadosRecientemente(false);
      }, 2000); // 2 segundos de protección
      return;
    }
    
    if (userData) {
      console.log('Propiedades de userData:', Object.keys(userData));
      console.log('userData.uid:', userData.uid);
      console.log('userData.id:', userData.id);
      console.log('userData.UID:', userData.UID);
      
      setFormData({
        Nombre: userData.Nombre || userData.nombre || '',
        Correo: userData.Correo || userData.email || userData.correo || '',
        telefono: userData.telefono || ''
      });
    }
  }, [userData, datosActualizadosRecientemente]);

  // Función para manejar cambios con validación en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Asegurar que value nunca sea undefined
    const valorSeguro = value || '';
    let valorFormateado = valorSeguro;
    
    // Aplicar formato según el tipo de campo
    switch (name) {
      case 'Nombre':
        valorFormateado = formatearInput(valorSeguro, 'nombre');
        // Limitar caracteres
        if (valorFormateado && valorFormateado.length > LIMITES.NOMBRE.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.NOMBRE.max);
        }
        break;
      case 'Correo':
        valorFormateado = formatearInput(valorSeguro, 'correo');
        // Limitar caracteres
        if (valorFormateado && valorFormateado.length > LIMITES.EMAIL.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.EMAIL.max);
        }
        break;
      case 'telefono':
        valorFormateado = formatearInput(valorSeguro, 'telefono');
        // Limitar caracteres
        if (valorFormateado && valorFormateado.length > LIMITES.TELEFONO.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.TELEFONO.max);
        }
        break;
      default:
        valorFormateado = valorSeguro;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormateado || ''
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validación en tiempo real para email único (solo si cambió)
    if (name === 'Correo' && valorFormateado && valorFormateado !== userData?.Correo && valorFormateado !== userData?.email && valorFormateado !== userData?.correo && valorFormateado.length >= 5) {
      validarEmailUnicoConDebounce(valorFormateado, setValidacionEmail);
    } else if (name === 'Correo') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }
  };

  const handleCambiarPassword = () => {
    Swal.fire({
      title: 'Cambiar Contraseña',
      html: `
        <div class="mb-3">
          <label class="form-label">Nueva contraseña:</label>
          <input type="password" id="nuevaPassword" class="form-control" placeholder="Mínimo 6 caracteres">
        </div>
        <div class="mb-3">
          <label class="form-label">Confirmar contraseña:</label>
          <input type="password" id="confirmarPassword" class="form-control" placeholder="Repite la contraseña">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cambiar Contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      preConfirm: () => {
        const nuevaPassword = document.getElementById('nuevaPassword').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;
        
        if (!nuevaPassword) {
          Swal.showValidationMessage('Ingresa la nueva contraseña');
          return false;
        }
        
        if (nuevaPassword.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
        
        if (nuevaPassword !== confirmarPassword) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }
        
        return { nuevaPassword };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          
          // Aquí llamarías al servicio para cambiar la contraseña
          // await cambiarPasswordAdmin(userData.uid, result.value.nuevaPassword);
          
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Tu contraseña ha sido cambiada exitosamente',
            confirmButtonColor: '#28a745'
          });
        } catch (error) {
          console.error('Error al cambiar contraseña:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cambiar la contraseña. Inténtalo nuevamente.',
            confirmButtonColor: '#28a745'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    console.log('Validando formulario con formData:', formData);

    // Validar nombre
    try {
      const errorNombre = validarNombre(formData.Nombre || '', 'Nombre');
      if (errorNombre) nuevosErrores.Nombre = errorNombre;
    } catch (error) {
      console.error('Error validando nombre:', error);
      nuevosErrores.Nombre = 'Error al validar nombre';
    }

    // Validar email
    try {
      const errorEmail = validarEmail(formData.Correo || '');
      if (errorEmail) nuevosErrores.Correo = errorEmail;
    } catch (error) {
      console.error('Error validando email:', error);
      nuevosErrores.Correo = 'Error al validar email';
    }

    // Validar teléfono (opcional pero con formato correcto si se proporciona)
    try {
      if (formData.telefono && formData.telefono.trim()) {
        const telefonoLimpio = formData.telefono.trim();
        if (telefonoLimpio.length < LIMITES.TELEFONO.min) {
          nuevosErrores.telefono = `Teléfono debe tener al menos ${LIMITES.TELEFONO.min} caracteres`;
        } else if (telefonoLimpio.length > LIMITES.TELEFONO.max) {
          nuevosErrores.telefono = `Teléfono no puede exceder ${LIMITES.TELEFONO.max} caracteres`;
        } else if (!/^[+]?[\d\s\-()]+$/.test(telefonoLimpio)) {
          nuevosErrores.telefono = 'Teléfono solo puede contener números, espacios, guiones y paréntesis';
        }
      }
    } catch (error) {
      console.error('Error validando teléfono:', error);
      nuevosErrores.telefono = 'Error al validar teléfono';
    }

    // Validar email único si cambió
    try {
      if (formData.Correo && formData.Correo !== userData?.Correo && formData.Correo !== userData?.email && formData.Correo !== userData?.correo && validacionEmail.esUnico === false) {
        nuevosErrores.Correo = validacionEmail.mensaje;
      }
    } catch (error) {
      console.error('Error validando email único:', error);
    }
    
    console.log('Errores de validación:', nuevosErrores);
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevosErrores = validarFormulario();
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);
    
    try {
      console.log('userData completa:', userData);
      
      const datosActualizados = {
        Nombre: formData.Nombre.trim(),
        Correo: formData.Correo.trim(),
        telefono: formData.telefono.trim()
      };
      
      console.log('Datos a enviar:', datosActualizados);
      
      // Para administradores, el ID puede estar en userData.uid, userData.id, o userData.UID
      const adminId = userData.uid || userData.id || userData.UID;
      
      if (!adminId) {
        throw new Error('No se pudo obtener el ID del administrador. UserData: ' + JSON.stringify(userData));
      }
      
      console.log('ID del admin a actualizar:', adminId);

      await actualizarPerfilAdmin(adminId, datosActualizados);
      
      // Forzar actualización local inmediata
      setFormData({
        Nombre: datosActualizados.Nombre,
        Correo: datosActualizados.Correo,
        telefono: datosActualizados.telefono
      });
      
      // Marcar que los datos fueron actualizados para evitar sobrescritura
      setDatosActualizadosRecientemente(true);
      
      setIsEditing(false);
      
      // Mostrar éxito inmediatamente
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos de administrador han sido actualizados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Actualizar el contexto en segundo plano (sin esperar)
      try {
        if (updateUserData && typeof updateUserData === 'function') {
          const updatePromise = updateUserData();
          // Verificar si es una promesa antes de llamar .catch()
          if (updatePromise && typeof updatePromise === 'object' && typeof updatePromise.catch === 'function') {
            updatePromise.catch(error => {
              console.log('Error actualizando contexto (no crítico):', error);
            });
          }
        }
      } catch (error) {
        console.log('Error al intentar actualizar contexto:', error);
      }
      
    } catch (error) {
      console.error('Error al actualizar perfil de admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (userData) {
      setFormData({
        Nombre: userData.Nombre || userData.nombre || '',
        Correo: userData.Correo || userData.email || userData.correo || '',
        telefono: userData.telefono || ''
      });
    }
    setErrores({});
    setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    setDatosActualizadosRecientemente(false); // Reset de la bandera
    setIsEditing(false);
  };

  if (!userData) {
    return <LoadingSpinner text="Cargando perfil de administrador..." />;
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 text-success">
                <i className="fas fa-user-shield me-2"></i>
                Mi Perfil de Administrador
              </h1>
              <p className="text-muted mb-0">
                Gestiona tu información personal como administrador del sistema
              </p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-warning text-dark me-3">
                <i className="fas fa-crown me-1"></i>
                {userData?.esAdminPrincipal ? 'Admin Principal' : 'Administrador'}
              </span>
              {!isEditing ? (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Editar Perfil
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleCambiarPassword()}
                  >
                    <i className="fas fa-key me-2"></i>
                    Cambiar Contraseña
                  </button>
                </div>
              ) : (
                <div className="btn-group">
                  <button
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading || validacionEmail.validando || validacionEmail.esUnico === false}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Guardar
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Información Personal
              </h5>
            </div>
            <div className="card-body">
              {!isEditing ? (
                // Vista de solo lectura
                <div>
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="text-center mb-3">
                        <div className="user-avatar-xl bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px', fontSize: '2.5rem'}}>
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <h5 className="mb-1">{userData.Nombre || userData.nombre || 'Administrador'}</h5>
                        <p className="text-muted mb-0">
                          <small>
                            <i className="fas fa-crown me-1"></i>
                            {userData?.esAdminPrincipal ? 'Administrador Principal' : 'Administrador'}
                          </small>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="border rounded p-3 bg-light">
                            <div className="row">
                              <div className="col-sm-4">
                                <strong>
                                  <i className="fas fa-user me-2 text-success"></i>
                                  Nombre:
                                </strong>
                              </div>
                              <div className="col-sm-8">
                                {userData.Nombre || userData.nombre || 'No especificado'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <div className="border rounded p-3 bg-light">
                            <div className="row">
                              <div className="col-sm-4">
                                <strong>
                                  <i className="fas fa-envelope me-2 text-success"></i>
                                  Correo:
                                </strong>
                              </div>
                              <div className="col-sm-8">
                                {userData.Correo || userData.email || userData.correo || 'No especificado'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12">
                          <div className="border rounded p-3 bg-light">
                            <div className="row">
                              <div className="col-sm-4">
                                <strong>
                                  <i className="fas fa-phone me-2 text-success"></i>
                                  Teléfono:
                                </strong>
                              </div>
                              <div className="col-sm-8">
                                {userData.telefono || 'No especificado'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="border rounded p-3 bg-light">
                            <div className="row">
                              <div className="col-sm-4">
                                <strong>
                                  <i className="fas fa-key me-2 text-success"></i>
                                  Permisos:
                                </strong>
                              </div>
                              <div className="col-sm-8">
                                <span className="badge bg-success me-2">Gestión de Usuarios</span>
                                <span className="badge bg-success me-2">Gestión de Empresas</span>
                                <span className="badge bg-success me-2">Configuración</span>
                                {userData?.esAdminPrincipal && (
                                  <span className="badge bg-warning text-dark">Administrador Principal</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Vista de edición
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.Nombre ? 'is-invalid' : ''}`}
                        name="Nombre"
                        value={formData.Nombre}
                        onChange={handleChange}
                        maxLength={LIMITES.NOMBRE.max}
                        placeholder="Tu nombre completo"
                        disabled={loading}
                        autoComplete="new-password"
                        required
                      />
                      {errores.Nombre && (
                        <div className="invalid-feedback">{errores.Nombre}</div>
                      )}
                      <small className="text-muted">
                        {formData.Nombre.length}/{LIMITES.NOMBRE.max} caracteres - Solo letras y espacios
                      </small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="fas fa-envelope me-2"></i>
                        Correo electrónico *
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          className={`form-control ${
                            errores.Correo ? 'is-invalid' : 
                            validacionEmail.esUnico === false ? 'is-invalid' :
                            validacionEmail.esUnico === true ? 'is-valid' : ''
                          }`}
                          name="Correo"
                          value={formData.Correo}
                          onChange={handleChange}
                          maxLength={LIMITES.EMAIL.max}
                          placeholder="admin@ecofood.com"
                          disabled={loading}
                          autoComplete="new-password"
                          required
                        />
                        <span className="input-group-text">
                          {validacionEmail.validando && (
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                          )}
                          {validacionEmail.esUnico === true && !validacionEmail.validando && (
                            <i className="fas fa-check-circle text-success"></i>
                          )}
                          {validacionEmail.esUnico === false && !validacionEmail.validando && (
                            <i className="fas fa-times-circle text-danger"></i>
                          )}
                        </span>
                      </div>
                      {errores.Correo && (
                        <div className="invalid-feedback">{errores.Correo}</div>
                      )}
                      {!errores.Correo && validacionEmail.mensaje && (
                        <div className={`form-text ${
                          validacionEmail.esUnico === false ? 'text-danger' : 
                          validacionEmail.esUnico === true ? 'text-success' : 'text-info'
                        }`}>
                          {validacionEmail.mensaje}
                        </div>
                      )}
                      <small className="text-muted">
                        {formData.Correo.length}/{LIMITES.EMAIL.max} caracteres
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="fas fa-phone me-2"></i>
                        Teléfono
                        <small className="text-muted ms-2">(opcional)</small>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength={LIMITES.TELEFONO.max}
                        placeholder="+56 9 1234 5678"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      {errores.telefono && (
                        <div className="invalid-feedback">{errores.telefono}</div>
                      )}
                      <small className="text-muted">
                        {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres - Solo números, +, -, espacios
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>Nota:</strong> Los permisos de administrador no se pueden modificar desde aquí. 
                        Contacta al administrador principal si necesitas cambios en tus permisos.
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;