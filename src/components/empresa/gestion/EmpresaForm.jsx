import React, { useState, useEffect } from 'react';
import { validarFormularioEmpresa, formatearInput, LIMITES } from '../../../utils/validaciones';
import { registrarEmpresaConAuth, actualizarEmpresaConAuth } from '../../../services/empresaFirebase';
import { obtenerEmpresaPorId } from '../../../services/empresas/empresasOperaciones';
import { validarEmailUnicoConDebounce, validarRutUnicoConDebounce } from '../../../services/shared/validacionesUnicas';
import SelectorPaisComunaAPI from '../../common/SelectorPaisComunaAPI';
import Swal from 'sweetalert2';

/**
 * Componente de formulario para crear o editar empresas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.empresaId - ID de la empresa a editar (si es edición)
 * @param {Function} props.onSave - Función a ejecutar después de guardar
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 */
export default function EmpresaForm({ empresaId, onSave, onCancel }) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    pais: '',
    comuna: '',
    direccion: '',
    email: '',
    telefono: '',
    password: '' // Nuevo campo para contraseña
  });
  
  // Estado para los errores de validación
  const [errores, setErrores] = useState({});
  
  // Estado para mostrar cargando
  const [isLoading, setIsLoading] = useState(false);

  // Estados para validaciones únicas en tiempo real
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });

  const [validacionRut, setValidacionRut] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });
  
  // Determinar si es edición o creación
  const isEditing = !!empresaId;
  
  // Cargar datos de la empresa si estamos editando
  useEffect(() => {
    const cargarEmpresa = async () => {
      if (isEditing) {
        setIsLoading(true);
        try {
          const empresa = await obtenerEmpresaPorId(empresaId);
          setFormData({
            nombre: empresa.nombre || '',
            rut: empresa.rut || '',
            pais: empresa.pais || '',
            comuna: empresa.comuna || '',
            direccion: empresa.direccion || '',
            email: empresa.email || '',
            telefono: empresa.telefono || '',
            password: '' // No cargar contraseña por seguridad
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar los datos de la empresa'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    cargarEmpresa();
  }, [empresaId, isEditing]);
  
  // Manejar cambios en los campos del formulario con validación y formateo
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
      case 'email':
        valorFormateado = formatearInput(value, 'email');
        break;
      case 'rut':
        valorFormateado = formatearInput(value, 'rut');
        break;
      case 'comuna':
        valorFormateado = formatearInput(value, 'nombre');
        break;
      default:
        valorFormateado = value;
    }
    
    // Aplicar límites de caracteres
    const limite = LIMITES[name.toUpperCase()];
    if (limite && valorFormateado.length > limite.max) {
      valorFormateado = valorFormateado.substring(0, limite.max);
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: valorFormateado
    }));
    
    // Limpiar error del campo cuando cambia
    if (errores[name]) {
      setErrores(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }

    // Validaciones en tiempo real para email y RUT únicos
    if (name === 'email' && valorFormateado.length >= 5) {
      validarEmailUnicoConDebounce(valorFormateado, isEditing ? empresaId : null, setValidacionEmail);
    } else if (name === 'email') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }

    if (name === 'rut' && valorFormateado.length >= 9) {
      validarRutUnicoConDebounce(valorFormateado, isEditing ? empresaId : null, setValidacionRut);
    } else if (name === 'rut') {
      setValidacionRut({ validando: false, esUnico: null, mensaje: null, error: null });
    }
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const erroresValidacion = validarFormularioEmpresa(formData, !isEditing);
    
    // Agregar errores de validaciones únicas
    if (!isEditing && validacionEmail.esUnico === false) {
      erroresValidacion.email = validacionEmail.mensaje;
    }
    
    if (validacionRut.esUnico === false) {
      erroresValidacion.rut = validacionRut.mensaje;
    }
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        text: 'Por favor corrige los errores en el formulario'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing) {
        // Actualizar empresa existente (sin campo de contraseña)
        const datosActualizados = {
          nombre: formData.nombre.trim(),
          rut: formData.rut.trim(),
          pais: formData.pais.trim(),
          comuna: formData.comuna.trim(),
          direccion: formData.direccion.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim()
        };
        
        await actualizarEmpresaConAuth(empresaId, datosActualizados);
        Swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'La empresa ha sido actualizada correctamente',
          timer: 2000
        });
      } else {
        // Crear nueva empresa
        const nuevaEmpresa = {
          nombre: formData.nombre.trim(),
          rut: formData.rut.trim(),
          pais: formData.pais.trim(),
          comuna: formData.comuna.trim(),
          direccion: formData.direccion.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          password: formData.password.trim()
        };
        
        await registrarEmpresaConAuth(nuevaEmpresa);
        Swal.fire({
          icon: 'success',
          title: 'Registrada',
          text: 'La empresa ha sido registrada correctamente',
          timer: 2000
        });
      }
      
      // Ejecutar callback de éxito
      if (onSave) {
        onSave();
      }
      
    } catch (error) {
      console.error('Error al guardar empresa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la empresa'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el formulario
  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {isEditing ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
        </h5>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Nombre de la empresa */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Nombre de la Empresa <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={LIMITES.NOMBRE?.max || 100}
                  disabled={isLoading}
                />
                {errores.nombre && (
                  <div className="invalid-feedback">{errores.nombre}</div>
                )}
                <div className="form-text">
                  {formData.nombre.length}/{LIMITES.NOMBRE?.max || 100} caracteres
                </div>
              </div>

              {/* RUT */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  RUT <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control ${
                      errores.rut ? 'is-invalid' : 
                      validacionRut.esUnico === false ? 'is-invalid' :
                      validacionRut.esUnico === true ? 'is-valid' : ''
                    }`}
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    maxLength={LIMITES.RUT?.max || 12}
                    disabled={isLoading}
                  />
                  {validacionRut.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Verificando...</span>
                      </div>
                    </div>
                  )}
                  {validacionRut.esUnico === true && !validacionRut.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <i className="fas fa-check-circle text-success"></i>
                    </div>
                  )}
                  {validacionRut.esUnico === false && !validacionRut.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <i className="fas fa-times-circle text-danger"></i>
                    </div>
                  )}
                </div>
                {errores.rut && (
                  <div className="invalid-feedback">{errores.rut}</div>
                )}
                {!errores.rut && validacionRut.mensaje && (
                  <div className={`small mt-1 ${
                    validacionRut.esUnico === false ? 'text-danger' : 
                    validacionRut.esUnico === true ? 'text-success' : 'text-info'
                  }`}>
                    <i className={`fas ${
                      validacionRut.esUnico === false ? 'fa-exclamation-triangle' :
                      validacionRut.esUnico === true ? 'fa-check' : 'fa-info-circle'
                    } me-1`}></i>
                    {validacionRut.mensaje}
                  </div>
                )}
              </div>
            </div>

            {/* Selector de País y Comuna */}
            <SelectorPaisComunaAPI 
              formData={formData}
              setFormData={setFormData}
              errores={errores}
            />

            <div className="row">
              {/* Dirección */}
              <div className="col-12 mb-3">
                <label className="form-label">
                  Dirección <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  maxLength={LIMITES.DIRECCION?.max || 200}
                  disabled={isLoading}
                />
                {errores.direccion && (
                  <div className="invalid-feedback">{errores.direccion}</div>
                )}
                <div className="form-text">
                  {formData.direccion.length}/{LIMITES.DIRECCION?.max || 200} caracteres
                </div>
              </div>
            </div>

            <div className="row">
              {/* Email */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    className={`form-control ${
                      errores.email ? 'is-invalid' : 
                      validacionEmail.esUnico === false ? 'is-invalid' :
                      validacionEmail.esUnico === true ? 'is-valid' : ''
                    }`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={LIMITES.EMAIL?.max || 100}
                    disabled={isLoading || isEditing} // Deshabilitar email en edición
                  />
                  {!isEditing && validacionEmail.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Verificando...</span>
                      </div>
                    </div>
                  )}
                  {!isEditing && validacionEmail.esUnico === true && !validacionEmail.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <i className="fas fa-check-circle text-success"></i>
                    </div>
                  )}
                  {!isEditing && validacionEmail.esUnico === false && !validacionEmail.validando && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <i className="fas fa-times-circle text-danger"></i>
                    </div>
                  )}
                </div>
                {errores.email && (
                  <div className="invalid-feedback">{errores.email}</div>
                )}
                {!isEditing && !errores.email && validacionEmail.mensaje && (
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
                {isEditing && (
                  <div className="form-text text-muted">
                    <i className="fas fa-lock me-1"></i>
                    El email no se puede modificar
                  </div>
                )}
              </div>

              {/* Teléfono */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  maxLength={LIMITES.TELEFONO?.max || 15}
                  disabled={isLoading}
                />
                {errores.telefono && (
                  <div className="invalid-feedback">{errores.telefono}</div>
                )}
              </div>
            </div>

            {/* Campo de contraseña solo para nuevas empresas */}
            {!isEditing && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Contraseña <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errores.password && (
                    <div className="invalid-feedback">{errores.password}</div>
                  )}
                  <div className="form-text">
                    Mínimo 6 caracteres, debe incluir letras y números
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isLoading || validacionEmail.validando || validacionRut.validando || 
                         (!isEditing && validacionEmail.esUnico === false) || 
                         (validacionRut.esUnico === false)}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                    {isEditing ? 'Actualizar' : 'Registrar'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 