import React, { useState, useEffect } from 'react';
import { obtenerEmpresaPorId } from '../../../services/empresas/empresasOperaciones';
import Swal from 'sweetalert2';

/**
 * Componente para cambiar la contraseña de una empresa
 * @param {Object} props - Propiedades del componente
 * @param {string} props.empresaId - ID de la empresa
 * @param {Function} props.onSave - Función a ejecutar después de guardar
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 */
export default function CambiarPasswordEmpresa({ empresaId, onSave, onCancel }) {
  const [empresa, setEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);

  // Cargar datos de la empresa
  useEffect(() => {
    const cargarEmpresa = async () => {
      if (empresaId) {
        setLoadingEmpresa(true);
        try {
          const empresaData = await obtenerEmpresaPorId(empresaId);
          setEmpresa(empresaData);
        } catch (error) {
          console.error('Error al cargar empresa:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los datos de la empresa'
          });
        } finally {
          setLoadingEmpresa(false);
        }
      }
    };

    cargarEmpresa();
  }, [empresaId]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores cuando el usuario escriba
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const erroresValidacion = {};

    if (!formData.nuevaPassword) {
      erroresValidacion.nuevaPassword = 'La nueva contraseña es requerida';
    } else if (formData.nuevaPassword.length < 6) {
      erroresValidacion.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Debe confirmar la nueva contraseña';
    } else if (formData.nuevaPassword !== formData.confirmarPassword) {
      erroresValidacion.confirmarPassword = 'Las contraseñas no coinciden';
    }

    return erroresValidacion;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const erroresValidacion = validarFormulario();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar cambio de contraseña en Firebase Auth
      // Por ahora solo simulamos el éxito
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña cambiada',
        text: `La contraseña de la empresa ${empresa.nombre} ha sido cambiada correctamente.`,
        timer: 3000
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Inténtelo nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmpresa) {
    return (
      <div className="card shadow">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        No se pudieron cargar los datos de la empresa.
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          <i className="fas fa-lock me-2"></i>
          Cambiar Contraseña - {empresa.nombre}
        </h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info">
          <div className="d-flex align-items-start">
            <i className="fas fa-info-circle me-2 mt-1"></i>
            <div>
              <strong>Empresa:</strong> {empresa.nombre}<br />
              <strong>RUT:</strong> {empresa.rut}<br />
              <strong>Email:</strong> {empresa.email}
              <p className="mb-0 mt-2">
                Está cambiando la contraseña de acceso al sistema para esta empresa.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nuevaPassword" className="form-label">
              Nueva contraseña *
              <small className="text-muted ms-2">(Mínimo 6 caracteres)</small>
            </label>
            <input 
              type="password" 
              className={`form-control ${errores.nuevaPassword ? 'is-invalid' : ''}`}
              id="nuevaPassword" 
              name="nuevaPassword"
              value={formData.nuevaPassword}
              onChange={handleChange}
              minLength={6}
              placeholder="Ingrese la nueva contraseña"
              required
            />
            {errores.nuevaPassword && <div className="invalid-feedback">{errores.nuevaPassword}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="confirmarPassword" className="form-label">
              Confirmar nueva contraseña *
            </label>
            <input 
              type="password" 
              className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
              id="confirmarPassword" 
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder="Confirme la nueva contraseña"
              required
            />
            {errores.confirmarPassword && <div className="invalid-feedback">{errores.confirmarPassword}</div>}
          </div>

          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Importante:</strong> Una vez cambiada la contraseña, la empresa deberá usar la nueva contraseña para acceder al sistema.
          </div>

          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary me-2"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="fas fa-times me-1"></i>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-warning"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cambiando...
                </>
              ) : (
                <>
                  <i className="fas fa-key me-2"></i>
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 