import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarPerfilUsuario } from '../../services/auth/authService';
import { validarEmailUnicoConDebounce } from '../../services/shared/validacionesUnicas';
import SelectorPaisComunaAPI from '../../components/common/SelectorPaisComunaAPI';
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

  // Estado para validación única de email
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
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
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validación en tiempo real para email único (solo si cambió)
    if (name === 'correo' && value !== userData?.correo && value !== userData?.email && value.length >= 5) {
      validarEmailUnicoConDebounce(value, userData?.uid, setValidacionEmail);
    } else if (name === 'correo') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      nuevosErrores.correo = 'El formato del correo no es válido';
    }

    if (!formData.pais.trim()) {
      nuevosErrores.pais = 'El país es obligatorio';
    }

    if (!formData.comuna.trim()) {
      nuevosErrores.comuna = 'La comuna es obligatoria';
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria';
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
        pais: formData.pais.trim(),
        comuna: formData.comuna.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim()
      };

      await actualizarPerfilUsuario(userData.uid, datosActualizados, userType);
      
      // Actualizar el contexto con los nuevos datos
      await updateUserData();
      
      setIsEditing(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tus datos han sido actualizados correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
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
                  
                  <div className="d-flex justify-content-end">
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
                      <label className="form-label">Nombre completo *</label>
                      <input
                        type="text"
                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errores.nombre && (
                        <div className="invalid-feedback">{errores.nombre}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Correo electrónico *</label>
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
                    </div>
                  </div>

                  <SelectorPaisComunaAPI 
                    formData={formData}
                    setFormData={setFormData}
                    errores={errores}
                  />

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Dirección *</label>
                      <input
                        type="text"
                        className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errores.direccion && (
                        <div className="invalid-feedback">{errores.direccion}</div>
                      )}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        disabled={loading}
                      />
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