import React, { useState, useEffect } from 'react';
import { validarFormularioEmpresa, formatearInput, LIMITES } from '../../../utils/validaciones';
import { registrarEmpresaConAuth, actualizarEmpresaConAuth } from '../../../services/empresaFirebase';
import { obtenerEmpresaPorId } from '../../../services/empresas/empresasOperaciones';
import { validarEmailUnicoConDebounce, validarRutUnicoConDebounce } from '../../../services/validacionesUnicas';
import SelectorPaisComunaAPI from '../../SelectorPaisComunaAPI';
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
          password: formData.password
        };
        
        await registrarEmpresaConAuth(nuevaEmpresa);
        Swal.fire({
          icon: 'success',
          title: 'Empresa Creada',
          text: `La empresa ${nuevaEmpresa.nombre} ha sido creada correctamente. Se ha enviado un correo de verificación a ${nuevaEmpresa.email}. La empresa podrá hacer login una vez que verifique su email.`,
          timer: 5000
        });
      }
      
      // Llamar a la función onSave después de guardar
      if (onSave) {
        onSave();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al guardar la empresa'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar el formulario
  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {isEditing ? 'Editar Empresa' : 'Crear Nueva Empresa'}
        </h5>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre de la empresa *
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
                placeholder="Ingrese el nombre de la empresa"
                required
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              <small className="text-muted">
                {formData.nombre.length}/{LIMITES.NOMBRE.max} caracteres
              </small>
            </div>
            
            <div className="mb-3">
              <label htmlFor="rut" className="form-label">
                RUT *
                <small className="text-muted ms-2">
                  ({LIMITES.RUT.min}-{LIMITES.RUT.max} caracteres, formato: 12345678-9)
                </small>
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className={`form-control ${
                    errores.rut ? 'is-invalid' : 
                    validacionRut.esUnico === false ? 'is-invalid' :
                    validacionRut.esUnico === true ? 'is-valid' : ''
                  }`}
                  id="rut"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  maxLength={LIMITES.RUT.max}
                  placeholder="12345678-9"
                  required
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
              {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
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
              <small className="text-muted">
                {formData.rut.length}/{LIMITES.RUT.max} caracteres
              </small>
            </div>
            
            {/* Selector de País y Comuna con APIs */}
            <SelectorPaisComunaAPI
              paisSeleccionado={formData.pais}
              comunaSeleccionada={formData.comuna}
              onPaisChange={(pais) => setFormData({ ...formData, pais })}
              onComunaChange={(comuna) => setFormData({ ...formData, comuna })}
              errores={errores}
              disabled={isLoading}
            />
            
            <div className="mb-3">
              <label htmlFor="direccion" className="form-label">
                Dirección de la empresa *
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
                placeholder="Ej: Av. Libertador 1234, Oficina 567"
                required
              />
              {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
              <small className="text-muted">
                {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
              </small>
              <div className="form-text text-muted">
                <i className="fas fa-building me-1"></i>
                Dirección completa de la empresa (calle, número, oficina, etc.)
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">
                  Email *
                  <small className="text-muted ms-2">
                    ({LIMITES.EMAIL.min}-{LIMITES.EMAIL.max} caracteres)
                  </small>
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    className={`form-control ${
                      errores.email ? 'is-invalid' : 
                      !isEditing && validacionEmail.esUnico === false ? 'is-invalid' :
                      !isEditing && validacionEmail.esUnico === true ? 'is-valid' : ''
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={LIMITES.EMAIL.max}
                    placeholder="empresa@ejemplo.com"
                    required={!isEditing}
                    readOnly={isEditing}
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
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                {!errores.email && !isEditing && validacionEmail.mensaje && (
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
                  <small className="text-muted">El email no se puede modificar.</small>
                )}
                {!isEditing && (
                  <small className="text-muted">
                    {formData.email.length}/{LIMITES.EMAIL.max} caracteres
                  </small>
                )}
              </div>
              
              <div className="col-md-6 mb-3">
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
            </div>
            
            {!isEditing && (
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
                <div className="mt-1">
                  <small className="text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    Esta contraseña permitirá a la empresa hacer login en el sistema
                  </small>
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-end mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={onCancel}
                disabled={isLoading}
              >
                <i className="fas fa-times me-1"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-1`}></i>
                    {isEditing ? 'Actualizar Empresa' : 'Crear Empresa'}
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