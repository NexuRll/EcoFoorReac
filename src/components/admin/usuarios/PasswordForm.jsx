import React from 'react';
import LoadingSpinner from '../../common/ui/LoadingSpinner';

const PasswordForm = ({
  formPassword,
  errores,
  loading,
  usuarioNombre,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-key me-2"></i>
          Cambiar Contraseña
        </h5>
        {usuarioNombre && (
          <small className="text-muted">
            Cliente: {usuarioNombre}
          </small>
        )}
      </div>
      
      <div className="card-body">
        {loading && <LoadingSpinner text="Cambiando contraseña..." />}
        
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Importante:</strong> La nueva contraseña debe tener al menos 6 caracteres.
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
              <div className="progress" style={{ height: '5px' }}>
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

export default PasswordForm; 