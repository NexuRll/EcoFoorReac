import React from 'react';

const EmpresaForm = ({
  formData,
  errores,
  loading,
  modoEdicion,
  onSubmit,
  onChange,
  onCancelar
}) => {
  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className={`fas ${modoEdicion ? 'fa-edit' : 'fa-plus'} me-2`}></i>
          {modoEdicion ? 'Editar Empresa' : 'Nueva Empresa'}
        </h5>
      </div>
      
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row">
            {/* Nombre de la empresa */}
            <div className="col-md-6 mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre de la Empresa <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                placeholder="Ingrese el nombre de la empresa"
                maxLength="100"
                required
              />
              {errores.nombre && (
                <div className="invalid-feedback">
                  {errores.nombre}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="empresa@ejemplo.com"
                maxLength="100"
                required
                disabled={modoEdicion} // No permitir cambiar email en edición
              />
              {errores.email && (
                <div className="invalid-feedback">
                  {errores.email}
                </div>
              )}
              {modoEdicion && (
                <small className="form-text text-muted">
                  El email no se puede modificar una vez registrada la empresa
                </small>
              )}
            </div>

            {/* RUT */}
            <div className="col-md-6 mb-3">
              <label htmlFor="rut" className="form-label">
                RUT <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={onChange}
                placeholder="12.345.678-9"
                maxLength="12"
                required
                disabled={modoEdicion} // No permitir cambiar RUT en edición
              />
              {errores.rut && (
                <div className="invalid-feedback">
                  {errores.rut}
                </div>
              )}
              {modoEdicion && (
                <small className="form-text text-muted">
                  El RUT no se puede modificar una vez registrada la empresa
                </small>
              )}
            </div>

            {/* Teléfono */}
            <div className="col-md-6 mb-3">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={onChange}
                placeholder="+56 9 1234 5678"
                maxLength="15"
              />
              {errores.telefono && (
                <div className="invalid-feedback">
                  {errores.telefono}
                </div>
              )}
            </div>

            {/* Dirección */}
            <div className="col-md-8 mb-3">
              <label htmlFor="direccion" className="form-label">
                Dirección
              </label>
              <input
                type="text"
                className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={onChange}
                placeholder="Calle, número, depto/oficina"
                maxLength="200"
              />
              {errores.direccion && (
                <div className="invalid-feedback">
                  {errores.direccion}
                </div>
              )}
            </div>

            {/* Comuna */}
            <div className="col-md-4 mb-3">
              <label htmlFor="comuna" className="form-label">
                Comuna
              </label>
              <input
                type="text"
                className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                id="comuna"
                name="comuna"
                value={formData.comuna}
                onChange={onChange}
                placeholder="Comuna"
                maxLength="50"
              />
              {errores.comuna && (
                <div className="invalid-feedback">
                  {errores.comuna}
                </div>
              )}
            </div>

            {/* Contraseña - Solo para nuevas empresas */}
            {!modoEdicion && (
              <div className="col-12 mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  required
                />
                {errores.password && (
                  <div className="invalid-feedback">
                    {errores.password}
                  </div>
                )}
                <small className="form-text text-muted">
                  La empresa recibirá un email de verificación para activar su cuenta
                </small>
              </div>
            )}

            {/* Estado - Solo para edición */}
            {modoEdicion && (
              <div className="col-12 mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activa"
                    name="activa"
                    checked={formData.activa}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="activa">
                    Empresa activa
                  </label>
                </div>
                <small className="form-text text-muted">
                  Las empresas inactivas no pueden acceder al sistema
                </small>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
              disabled={loading}
            >
              <i className="fas fa-times me-1"></i>
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {modoEdicion ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <i className={`fas ${modoEdicion ? 'fa-save' : 'fa-plus'} me-1`}></i>
                  {modoEdicion ? 'Actualizar Empresa' : 'Registrar Empresa'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpresaForm; 