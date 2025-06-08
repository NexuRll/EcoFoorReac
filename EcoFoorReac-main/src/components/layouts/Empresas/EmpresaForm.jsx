import React, { useState, useEffect } from 'react';
import { validarFormularioEmpresa, formatearInput, LIMITES } from '../../../utils/validaciones';
import { registrarEmpresaConAuth, actualizarEmpresaConAuth } from '../../../services/empresaFirebase';
import { obtenerEmpresaPorId } from '../../../services/empresas/empresasOperaciones';
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
    direccion: '',
    comuna: '',
    email: '',
    telefono: '',
    password: '' // Nuevo campo para contraseña
  });
  
  // Estado para los errores de validación
  const [errores, setErrores] = useState({});
  
  // Estado para mostrar cargando
  const [isLoading, setIsLoading] = useState(false);
  
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
            direccion: empresa.direccion || '',
            comuna: empresa.comuna || '',
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
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const erroresValidacion = validarFormularioEmpresa(formData);
    
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
        // Actualizar empresa existente
        const datosActualizados = {
          nombre: formData.nombre.trim(),
          rut: formData.rut.trim(),
          direccion: formData.direccion.trim(),
          comuna: formData.comuna.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim()
        };
        
        // Incluir contraseña solo si se proporcionó una nueva
        if (formData.password) {
          datosActualizados.password = formData.password;
        }
        
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
          direccion: formData.direccion.trim(),
          comuna: formData.comuna.trim(),
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
              <input
                type="text"
                className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                maxLength={LIMITES.RUT.max}
                placeholder="12345678-9"
                required
              />
              {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
              <small className="text-muted">
                {formData.rut.length}/{LIMITES.RUT.max} caracteres
              </small>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
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
              
              <div className="col-md-6 mb-3">
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
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">
                  Email *
                  <small className="text-muted ms-2">
                    ({LIMITES.EMAIL.min}-{LIMITES.EMAIL.max} caracteres)
                  </small>
                </label>
                <input
                  type="email"
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={LIMITES.EMAIL.max}
                  placeholder="empresa@ejemplo.com"
                  required={!isEditing}
                  readOnly={isEditing}
                />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
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
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                {isEditing ? 'Nueva contraseña (dejar en blanco para mantener actual)' : 'Contraseña *'}
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
                required={!isEditing}
              />
              {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              <small className="text-muted">
                {formData.password.length}/{LIMITES.PASSWORD.max} caracteres
              </small>
              {!isEditing && (
                <div className="mt-1">
                  <small className="text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    Esta contraseña permitirá a la empresa hacer login en el sistema
                  </small>
                </div>
              )}
            </div>
            
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