import React, { useState, useEffect } from 'react';

const PasswordChangeModal = ({ 
  show, 
  onHide, 
  usuario, 
  onChangePassword, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});

  // Efecto para manejar el modal de Bootstrap
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nuevaPassword) {
      nuevosErrores.nuevaPassword = 'La nueva contraseña es requerida';
    } else if (formData.nuevaPassword.length < 6) {
      nuevosErrores.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Confirmar contraseña es requerido';
    } else if (formData.nuevaPassword !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormulario();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    
    onChangePassword(usuario.id, formData.nuevaPassword);
  };

  const handleClose = () => {
    setFormData({
      nuevaPassword: '',
      confirmarPassword: ''
    });
    setErrores({});
    onHide();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block' }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-key me-2"></i>
                Cambiar Contraseña
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                disabled={loading}
              ></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Cambiando contraseña para: <strong>{usuario?.nombre || usuario?.Nombre}</strong>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="nuevaPassword" className="form-label">Nueva Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errores.nuevaPassword ? 'is-invalid' : ''}`}
                    id="nuevaPassword"
                    name="nuevaPassword"
                    value={formData.nuevaPassword}
                    onChange={handleChange}
                    placeholder="Ingrese la nueva contraseña"
                    minLength="6"
                    required
                    disabled={loading}
                  />
                  {errores.nuevaPassword && (
                    <div className="invalid-feedback">
                      {errores.nuevaPassword}
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmarPassword" className="form-label">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
                    id="confirmarPassword"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    placeholder="Confirme la nueva contraseña"
                    minLength="6"
                    required
                    disabled={loading}
                  />
                  {errores.confirmarPassword && (
                    <div className="invalid-feedback">
                      {errores.confirmarPassword}
                    </div>
                  )}
                </div>
                
                <div className="alert alert-warning mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <small>
                    El usuario deberá usar esta nueva contraseña para iniciar sesión.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose} 
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
                      <i className="fas fa-key me-1"></i>
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordChangeModal; 