import React, { useState } from 'react';
import { registrarEmpresaConAuth } from '../../../services/empresa/empresaFirebase';
import Swal from 'sweetalert2';

const EmpresaFormTest = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rut: '',
    password: '',
    telefono: '',
    direccion: '',
    comuna: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🧪 PRUEBA - Datos del formulario:', formData);
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.rut || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🧪 PRUEBA - Iniciando registro...');
      
      const resultado = await registrarEmpresaConAuth(formData);
      
      console.log('🧪 PRUEBA - Registro exitoso:', resultado);
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Empresa registrada correctamente'
      });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        rut: '',
        password: '',
        telefono: '',
        direccion: '',
        comuna: ''
      });
      
    } catch (error) {
      console.error('🧪 PRUEBA - Error en registro:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: error.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          🧪 FORMULARIO DE PRUEBA - Registro de Empresa
        </h5>
        <small>Este es un formulario simplificado para diagnosticar problemas</small>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre de la Empresa *</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: EcoFood Chile"
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="empresa@ejemplo.com"
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">RUT *</label>
              <input
                type="text"
                className="form-control"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12345678-9"
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Contraseña *</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength="6"
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle 123"
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Comuna</label>
              <input
                type="text"
                className="form-control"
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                placeholder="Santiago"
              />
            </div>
          </div>
          
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-warning"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registrando...
                </>
              ) : (
                <>
                  🧪 Probar Registro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="card-footer text-muted">
        <small>
          <strong>Instrucciones:</strong> Completa los campos y revisa la consola del navegador para ver los logs detallados.
        </small>
      </div>
    </div>
  );
};

export default EmpresaFormTest; 