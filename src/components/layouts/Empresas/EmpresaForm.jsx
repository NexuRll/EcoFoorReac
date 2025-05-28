import React, { useState, useEffect } from 'react';
import { validarEmpresa } from '../../../services/empresas/empresasValidaciones';
import { crearEmpresa, actualizarEmpresa, obtenerEmpresaPorId } from '../../../services/empresas/empresasOperaciones';
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
    telefono: ''
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
            telefono: empresa.telefono || ''
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
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
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
    const erroresValidacion = validarEmpresa(formData);
    
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing) {
        // Actualizar empresa existente
        await actualizarEmpresa(empresaId, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'La empresa ha sido actualizada correctamente',
          timer: 2000
        });
      } else {
        // Crear nueva empresa
        await crearEmpresa(formData);
        Swal.fire({
          icon: 'success',
          title: 'Creada',
          text: 'La empresa ha sido creada correctamente',
          timer: 2000
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
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>
            
            <div className="mb-3">
              <label htmlFor="rut" className="form-label">RUT</label>
              <input
                type="text"
                className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="XX.XXX.XXX-X"
              />
              {errores.rut && <div className="invalid-feedback">{errores.rut}</div>}
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <input
                  type="text"
                  className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Calle y número"
                />
                {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="comuna" className="form-label">Comuna</label>
                <input
                  type="text"
                  className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                  id="comuna"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  placeholder="Comuna"
                />
                {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@empresa.com"
                />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="987654321"
                />
                {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={onCancel}
                disabled={isLoading}
              >
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
                  isEditing ? 'Actualizar Empresa' : 'Crear Empresa'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 