import React from 'react';
import LoadingSpinner from '../../common/ui/LoadingSpinner';

const AdminForm = ({
  formData,
  errores,
  loading,
  isEditing = false,
  isPrincipal = false,
  onChange,
  onSubmit,
  onCancel
}) => {
  const titulo = isPrincipal 
    ? 'Configurar Administrador Principal' 
    : isEditing 
    ? 'Editar Administrador' 
    : 'Nuevo Administrador';

  const campos = isPrincipal 
    ? { nombre: 'Nombre', email: 'Correo', password: 'contraseña' }
    : { nombre: 'nombre', email: 'email', password: 'password' };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className={`fas ${isPrincipal ? 'fa-crown' : isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {titulo}
        </h5>
        {isPrincipal && (
          <small className="text-muted">
            Este será el administrador principal del sistema
          </small>
        )}
      </div>
      
      <div className="card-body">
        {loading && <LoadingSpinner text={isEditing ? "Actualizando..." : "Creando administrador..."} />}
        
        {isPrincipal && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Importante:</strong> El administrador principal tendrá acceso completo al sistema.
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="row">
            {/* Nombre */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                className={`form-control ${errores[campos.nombre] ? 'is-invalid' : ''}`}
                name={campos.nombre}
                value={formData[campos.nombre] || ''}
                onChange={onChange}
                placeholder="Ingrese el nombre completo"
                disabled={loading}
              />
              {errores[campos.nombre] && <div className="invalid-feedback">{errores[campos.nombre]}</div>}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${errores[campos.email] ? 'is-invalid' : ''}`}
                name={campos.email}
                value={formData[campos.email] || ''}
                onChange={onChange}
                placeholder="admin@ejemplo.com"
                disabled={loading || (isEditing && !isPrincipal)} // No permitir editar email en admins normales
              />
              {errores[campos.email] && <div className="invalid-feedback">{errores[campos.email]}</div>}
              {isEditing && !isPrincipal && (
                <div className="form-text text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  El email no se puede modificar por seguridad
                </div>
              )}
            </div>
          </div>

          {/* Contraseña */}
          {!isEditing && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Contraseña *</label>
                <input
                  type="password"
                  className={`form-control ${errores[campos.password] ? 'is-invalid' : ''}`}
                  name={campos.password}
                  value={formData[campos.password] || ''}
                  onChange={onChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                {errores[campos.password] && <div className="invalid-feedback">{errores[campos.password]}</div>}
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {formData[campos.password] && (
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fortaleza de la contraseña</label>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${
                        formData[campos.password].length < 6 ? 'bg-danger' :
                        formData[campos.password].length < 8 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ 
                        width: `${Math.min((formData[campos.password].length / 12) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <small className={`text-${
                    formData[campos.password].length < 6 ? 'danger' :
                    formData[campos.password].length < 8 ? 'warning' : 'success'
                  }`}>
                    {formData[campos.password].length < 6 ? 'Muy débil' :
                     formData[campos.password].length < 8 ? 'Débil' : 'Fuerte'}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Rol (solo para admins normales) */}
          {!isPrincipal && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  name="rol"
                  value={formData.rol || 'admin'}
                  onChange={onChange}
                  disabled={loading}
                >
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Administrador</option>
                </select>
                <div className="form-text text-muted">
                  Define los permisos del administrador
                </div>
              </div>
            </div>
          )}

          {/* Información adicional para edición */}
          {isEditing && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Nota:</strong> Para cambiar la contraseña, usa la opción "Cambiar Contraseña" en la lista.
            </div>
          )}

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            {!isPrincipal && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`btn ${isPrincipal ? 'btn-warning' : 'btn-primary'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isPrincipal ? 'fa-crown' : isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {isPrincipal ? 'Configurar Admin Principal' : isEditing ? 'Actualizar' : 'Crear Administrador'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm; 