import React from 'react';
import SelectorPaisComunaAPI from '../../common/SelectorPaisComunaAPI';
import LoadingSpinner from '../../common/ui/LoadingSpinner';

const UsuarioForm = ({
  formData,
  errores,
  loading,
  isEditing = false,
  validacionEmail,
  onChange,
  onSubmit,
  onCancel
}) => {
  const getEmailValidationIcon = () => {
    if (validacionEmail.validando) {
      return <div className="spinner-border spinner-border-sm text-primary" role="status"></div>;
    }
    if (validacionEmail.esUnico === true) {
      return <i className="fas fa-check-circle text-success"></i>;
    }
    if (validacionEmail.esUnico === false) {
      return <i className="fas fa-times-circle text-danger"></i>;
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h5>
      </div>
      
      <div className="card-body">
        {loading && <LoadingSpinner text={isEditing ? "Actualizando cliente..." : "Creando cliente..."} />}
        
        <form onSubmit={onSubmit}>
          <div className="row">
            {/* Nombre */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                placeholder="Ingrese el nombre completo"
                disabled={loading}
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <div className="input-group">
                <input
                  type="email"
                  className={`form-control ${errores.correo ? 'is-invalid' : validacionEmail.esUnico === true ? 'is-valid' : ''}`}
                  name="correo"
                  value={formData.correo}
                  onChange={onChange}
                  placeholder="ejemplo@correo.com"
                  disabled={loading || isEditing} // No permitir editar email
                />
                <span className="input-group-text">
                  {getEmailValidationIcon()}
                </span>
                {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
              </div>
              {validacionEmail.mensaje && (
                <div className={`form-text ${validacionEmail.esUnico === false ? 'text-danger' : 'text-success'}`}>
                  {validacionEmail.mensaje}
                </div>
              )}
              {isEditing && (
                <div className="form-text text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  El email no se puede modificar por seguridad
                </div>
              )}
            </div>
          </div>

          <div className="row">
            {/* Contraseña */}
            {!isEditing && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Contraseña *</label>
                <input
                  type="password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              </div>
            )}

            {/* Teléfono */}
            <div className={`${isEditing ? 'col-md-6' : 'col-md-6'} mb-3`}>
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                name="telefono"
                value={formData.telefono}
                onChange={onChange}
                placeholder="+56 9 1234 5678"
                disabled={loading}
              />
              {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
            </div>
          </div>

          {/* Selector de País y Comuna */}
          <SelectorPaisComunaAPI
            paisSeleccionado={formData.pais}
            comunaSeleccionada={formData.comuna}
            onPaisChange={(pais) => onChange({ target: { name: 'pais', value: pais } })}
            onComunaChange={(comuna) => onChange({ target: { name: 'comuna', value: comuna } })}
            errores={errores}
            disabled={loading}
          />

          {/* Dirección */}
          <div className="mb-3">
            <label className="form-label">Dirección</label>
            <textarea
              className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
              name="direccion"
              value={formData.direccion}
              onChange={onChange}
              placeholder="Dirección completa (opcional)"
              rows="2"
              disabled={loading}
            />
            {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
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
              className="btn btn-primary"
              disabled={loading || validacionEmail.validando || (validacionEmail.esUnico === false && !isEditing)}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm; 