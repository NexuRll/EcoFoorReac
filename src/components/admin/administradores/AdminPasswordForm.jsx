import React from 'react';
import LoadingSpinner from '../../common/ui/LoadingSpinner';

const AdminPasswordForm = ({
  formPassword,
  errores,
  loading,
  adminNombre,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-key me-2"></i>
          Cambiar Contraseña de Administrador
        </h5>
        {adminNombre && (
          <small className="text-muted">
            Administrador: {adminNombre}
          </small>
        )}
      </div>
      
      <div className="card-body">
        {loading && <LoadingSpinner text="Cambiando contraseña..." />}
        
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Importante:</strong> Esta acción cambiará la contraseña del administrador. 
          Asegúrate de comunicar la nueva contraseña de forma segura.
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nueva Contraseña *</label>
              <input
                type="password"
                className={`form-control ${errores.nuevaPassword ? 'is-invalid' : ''}`}
                name="nuevaPassword"
                value={formPassword.nuevaPassword}
                onChange={onChange}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              {errores.nuevaPassword && <div className="invalid-feedback">{errores.nuevaPassword}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Confirmar Contraseña *</label>
              <input
                type="password"
                className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
                name="confirmarPassword"
                value={formPassword.confirmarPassword}
                onChange={onChange}
                placeholder="Repita la contraseña"
                disabled={loading}
              />
              {errores.confirmarPassword && <div className="invalid-feedback">{errores.confirmarPassword}</div>}
            </div>
          </div>

          {/* Indicador de fortaleza de contraseña */}
          {formPassword.nuevaPassword && (
            <div className="mb-3">
              <small className="text-muted">Fortaleza de la contraseña:</small>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar ${
                    formPassword.nuevaPassword.length < 6 ? 'bg-danger' :
                    formPassword.nuevaPassword.length < 8 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ 
                    width: `${Math.min((formPassword.nuevaPassword.length / 12) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <small className={`text-${
                formPassword.nuevaPassword.length < 6 ? 'danger' :
                formPassword.nuevaPassword.length < 8 ? 'warning' : 'success'
              }`}>
                {formPassword.nuevaPassword.length < 6 ? 'Muy débil' :
                 formPassword.nuevaPassword.length < 8 ? 'Débil' : 'Fuerte'}
              </small>
            </div>
          )}

          {/* Validación en tiempo real */}
          {formPassword.nuevaPassword && formPassword.confirmarPassword && (
            <div className="mb-3">
              <div className={`alert ${
                formPassword.nuevaPassword === formPassword.confirmarPassword 
                  ? 'alert-success' 
                  : 'alert-danger'
              } py-2`}>
                <i className={`fas ${
                  formPassword.nuevaPassword === formPassword.confirmarPassword 
                    ? 'fa-check-circle' 
                    : 'fa-times-circle'
                } me-2`}></i>
                {formPassword.nuevaPassword === formPassword.confirmarPassword 
                  ? 'Las contraseñas coinciden' 
                  : 'Las contraseñas no coinciden'}
              </div>
            </div>
          )}

          {/* Recomendaciones de seguridad */}
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-shield-alt me-2"></i>
              Recomendaciones de seguridad:
            </h6>
            <ul className="mb-0">
              <li>Use al menos 8 caracteres</li>
              <li>Combine letras mayúsculas y minúsculas</li>
              <li>Incluya números y símbolos</li>
              <li>Evite información personal</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={loading || !formPassword.nuevaPassword || !formPassword.confirmarPassword}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
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
};

export default AdminPasswordForm; 