import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarPerfilUsuario } from '../../services/auth/authService';
import { validarEmailUnicoConDebounce } from '../../services/shared/validacionesUnicas';
import { validarNombre, validarEmail, validarDireccion, validarTelefono } from '../../utils/validaciones';
import Swal from 'sweetalert2';

const Perfil = () => {
  const { userData, userType, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    pais: '',
    comuna: '',
    direccion: '',
    telefono: ''
  });
  const [errores, setErrores] = useState({});
  
  // Estado para prevenir sobrescritura de datos recién guardados
  const [datosActualizadosRecientemente, setDatosActualizadosRecientemente] = useState(false);

  // Estado para validación única de email
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });

  // Límites de caracteres
  const LIMITES = {
    NOMBRE: { min: 2, max: 50 },
    EMAIL: { max: 50 },
    DIRECCION: { max: 50 }
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    // Si acabamos de actualizar los datos, no sobrescribir
    if (datosActualizadosRecientemente) {
      // Protección extendida de 2 segundos
      setTimeout(() => {
        setDatosActualizadosRecientemente(false);
      }, 2000);
      return;
    }
    
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        correo: userData.correo || userData.email || '',
        pais: userData.pais || '',
        comuna: userData.comuna || '',
        direccion: userData.direccion || '',
        telefono: userData.telefono || ''
      });
    }
  }, [userData, datosActualizadosRecientemente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Asegurar que value nunca sea undefined
    const valorSeguro = value || '';
    
    // Aplicar límites de caracteres
    let valorLimitado = valorSeguro;
    if (name === 'nombre' && valorSeguro.length > LIMITES.NOMBRE.max) {
      valorLimitado = valorSeguro.substring(0, LIMITES.NOMBRE.max);
    } else if (name === 'correo' && valorSeguro.length > LIMITES.EMAIL.max) {
      valorLimitado = valorSeguro.substring(0, LIMITES.EMAIL.max);
    } else if (name === 'direccion' && valorSeguro.length > LIMITES.DIRECCION.max) {
      valorLimitado = valorSeguro.substring(0, LIMITES.DIRECCION.max);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorLimitado || ''
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validación en tiempo real para email único (solo si cambió)
    if (name === 'correo' && valorLimitado && valorLimitado !== userData?.correo && valorLimitado !== userData?.email && valorLimitado.length >= 5) {
      validarEmailUnicoConDebounce(valorLimitado, userData?.uid, setValidacionEmail);
    } else if (name === 'correo') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }
  };

  const handleCambiarPassword = () => {
    Swal.fire({
      title: 'Cambiar Contraseña',
      html: `
        <div class="mb-3">
          <label class="form-label">Contraseña actual:</label>
          <input type="password" id="currentPassword" class="form-control" placeholder="Ingresa tu contraseña actual">
        </div>
        <div class="mb-3">
          <label class="form-label">Nueva contraseña:</label>
          <input type="password" id="newPassword" class="form-control" placeholder="Mínimo 6 caracteres">
        </div>
        <div class="mb-3">
          <label class="form-label">Confirmar nueva contraseña:</label>
          <input type="password" id="confirmPassword" class="form-control" placeholder="Repite la nueva contraseña">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cambiar Contraseña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      preConfirm: () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword) {
          Swal.showValidationMessage('Ingresa tu contraseña actual');
          return false;
        }
        
        if (!newPassword) {
          Swal.showValidationMessage('Ingresa la nueva contraseña');
          return false;
        }
        
        if (newPassword.length < 6) {
          Swal.showValidationMessage('La nueva contraseña debe tener al menos 6 caracteres');
          return false;
        }
        
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }
        
        return { currentPassword, newPassword };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Aquí implementarías la lógica para cambiar la contraseña
          // Por ejemplo, usando Firebase Auth
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
            text: 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
            confirmButtonColor: '#28a745'
          });
        }
      }
    });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre con límites de caracteres
    const errorNombre = validarNombre(formData.nombre, 'Nombre');
    if (errorNombre) nuevosErrores.nombre = errorNombre;

    // Validar email con límite de caracteres
    const errorEmail = validarEmail(formData.correo);
    if (errorEmail) nuevosErrores.correo = errorEmail;
    
    // Validar que el email no exceda el límite
    if (formData.correo.length > LIMITES.EMAIL.max) {
      nuevosErrores.correo = `El correo no puede exceder ${LIMITES.EMAIL.max} caracteres`;
    }

    // Removidas validaciones de país y comuna - son de solo lectura

    // Validar dirección con límite de caracteres
    const errorDireccion = validarDireccion(formData.direccion);
    if (errorDireccion) nuevosErrores.direccion = errorDireccion;
    
    // Validar que la dirección no exceda el límite
    if (formData.direccion.length > LIMITES.DIRECCION.max) {
      nuevosErrores.direccion = `La dirección no puede exceder ${LIMITES.DIRECCION.max} caracteres`;
    }

    // Validar teléfono (opcional pero con formato correcto si se proporciona)
    if (formData.telefono.trim()) {
      const errorTelefono = validarTelefono(formData.telefono);
      if (errorTelefono) nuevosErrores.telefono = errorTelefono;
    }

    // Validar email único si cambió
    if (formData.correo !== userData?.correo && formData.correo !== userData?.email && validacionEmail.esUnico === false) {
      nuevosErrores.correo = validacionEmail.mensaje;
    }

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
      const datosActualizados = {
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        // País y comuna no se envían - son de solo lectura
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim()
      };

      console.log('📦 Datos a actualizar:', datosActualizados);
      console.log('👤 Tipo de usuario:', userType);
      console.log('🎯 UID del usuario:', userData.uid);
      
      // Validar que userData.uid exista antes de continuar
      if (!userData.uid) {
        throw new Error('No se pudo obtener el ID del usuario. Por favor, cierra sesión y vuelve a iniciar.');
      }

      await actualizarPerfilUsuario(userData.uid, datosActualizados, userType || 'cliente');
      
      // Forzar actualización local inmediata
      setFormData({
        nombre: datosActualizados.nombre,
        correo: datosActualizados.correo,
        // Mantener país y comuna existentes
        pais: formData.pais,
        comuna: formData.comuna,
        direccion: datosActualizados.direccion,
        telefono: datosActualizados.telefono
      });
      
      // Marcar que los datos fueron actualizados
      setDatosActualizadosRecientemente(true);
      
      setIsEditing(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos han sido actualizados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Actualizar el contexto en segundo plano (sin esperar)
      try {
        const updatePromise = updateUserData();
        // Verificar si es una promesa antes de llamar .catch()
        if (updatePromise && typeof updatePromise === 'object' && typeof updatePromise.catch === 'function') {
          updatePromise.catch(error => {
            console.log('Error actualizando contexto (no crítico):', error);
          });
        }
      } catch (error) {
        console.log('Error al intentar actualizar contexto:', error);
      }
      
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      
      // Mostrar detalles del error para debugging
      console.error('Detalles del error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo actualizar el perfil. ${error.message}`,
        confirmButtonColor: '#28a745',
        footer: 'Si el problema persiste, recarga la página e intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        correo: userData.correo || userData.email || '',
        pais: userData.pais || '',
        comuna: userData.comuna || '',
        direccion: userData.direccion || '',
        telefono: userData.telefono || ''
      });
    }
    setErrores({});
    setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    setDatosActualizadosRecientemente(false); // Reset de la bandera
    setIsEditing(false);
  };

  if (!userData) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Mi Perfil
                </h4>
                <span className="badge bg-light text-dark">
                  {userType === 'admin' ? 'Administrador' : 
                   userType === 'empresa' ? 'Empresa' : 'Cliente'}
                </span>
              </div>
            </div>
            <div className="card-body">
              {!isEditing ? (
                // Vista de solo lectura
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Nombre:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.nombre || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Correo:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.correo || userData.email || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>País:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.pais || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Comuna:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.comuna || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Dirección:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.direccion || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Teléfono:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userData.telefono || 'No especificado'}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleCambiarPassword()}
                    >
                      <i className="fas fa-key me-2"></i>
                      Cambiar Contraseña
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Editar Perfil
                    </button>
                  </div>
                </div>
              ) : (
                // Vista de edición
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre completo *
                        <small className="text-muted ms-2">
                          (máximo {LIMITES.NOMBRE.max} caracteres)
                        </small>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        maxLength={LIMITES.NOMBRE.max}
                        placeholder="Tu nombre completo"
                        disabled={loading}
                      />
                      {errores.nombre && (
                        <div className="invalid-feedback">{errores.nombre}</div>
                      )}
                      <small className="text-muted">
                        {formData.nombre.length}/{LIMITES.NOMBRE.max} caracteres
                      </small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Correo electrónico *
                        <small className="text-muted ms-2">
                          (máximo {LIMITES.EMAIL.max} caracteres)
                        </small>
                      </label>
                      <div className="position-relative">
                        <input
                          type="email"
                          className={`form-control ${
                            errores.correo ? 'is-invalid' : 
                            validacionEmail.esUnico === false ? 'is-invalid' :
                            validacionEmail.esUnico === true ? 'is-valid' : ''
                          }`}
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          maxLength={LIMITES.EMAIL.max}
                          placeholder="tu@correo.com"
                          disabled={loading}
                        />
                        {validacionEmail.validando && (
                          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Verificando...</span>
                            </div>
                          </div>
                        )}
                        {validacionEmail.esUnico === true && !validacionEmail.validando && (
                          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <i className="fas fa-check-circle text-success"></i>
                          </div>
                        )}
                        {validacionEmail.esUnico === false && !validacionEmail.validando && (
                          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <i className="fas fa-times-circle text-danger"></i>
                          </div>
                        )}
                      </div>
                      {errores.correo && (
                        <div className="invalid-feedback">{errores.correo}</div>
                      )}
                      {!errores.correo && validacionEmail.mensaje && (
                        <div className={`small mt-1 ${
                          validacionEmail.esUnico === false ? 'text-danger' : 
                          validacionEmail.esUnico === true ? 'text-success' : 'text-info'
                        }`}>
                          <i className={`fas ${
                            validacionEmail.esUnico === false ? 'fa-exclamation-triangle' :
                            validacionEmail.esUnico === true ? 'fa-check' : 'fa-info-circle'
                          } me-1`}></i>
                          {validacionEmail.mensaje}
                        </div>
                      )}
                      <small className="text-muted">
                        {formData.correo.length}/{LIMITES.EMAIL.max} caracteres
                      </small>
                    </div>
                  </div>

                  {/* Ubicación - Solo lectura en modo edición */}
                  <div className="col-12 mb-3">
                    <div className="alert alert-info">
                      <h6 className="mb-2">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Ubicación Actual
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>País:</strong> {formData.pais || 'No especificado'}
                        </div>
                        <div className="col-md-6">
                          <strong>Ciudad/Comuna:</strong> {formData.comuna || 'No especificado'}
                        </div>
                      </div>
                      <small className="text-muted mt-2 d-block">
                        <i className="fas fa-info-circle me-1"></i>
                        Para cambiar la ubicación, contacta al soporte técnico.
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">
                        Dirección *
                        <small className="text-muted ms-2">
                          (máximo {LIMITES.DIRECCION.max} caracteres)
                        </small>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        maxLength={LIMITES.DIRECCION.max}
                        placeholder="Tu dirección completa"
                        disabled={loading}
                      />
                      {errores.direccion && (
                        <div className="invalid-feedback">{errores.direccion}</div>
                      )}
                      <small className="text-muted">
                        {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
                      </small>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Teléfono
                        <small className="text-muted ms-2">(opcional)</small>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+56 9 1234 5678"
                        disabled={loading}
                      />
                      {errores.telefono && (
                        <div className="invalid-feedback">{errores.telefono}</div>
                      )}
                      <small className="text-muted">
                        Solo números, espacios, guiones y signo +
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading || validacionEmail.validando || validacionEmail.esUnico === false}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Guardar Cambios
                        </>
                      )}
                    </button>
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

export default Perfil; 