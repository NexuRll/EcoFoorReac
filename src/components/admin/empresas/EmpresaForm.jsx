import React from 'react';
import { formatearInput, LIMITES } from '../../../utils/validaciones';

const EmpresaForm = ({
  formData,
  errores,
  loading,
  modoEdicion,
  onSubmit,
  onChange,
  onCancelar
}) => {
  
  // Función para manejar cambios con validación en tiempo real
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valorFormateado = value;
    
    // Aplicar formato según el tipo de campo
    switch (name) {
      case 'nombre':
        valorFormateado = formatearInput(value, 'nombre');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.EMPRESA_NOMBRE.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.EMPRESA_NOMBRE.max);
        }
        break;
      case 'email':
        valorFormateado = formatearInput(value, 'email');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.EMAIL.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.EMAIL.max);
        }
        break;
      case 'rut':
        valorFormateado = formatearInput(value, 'rut');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.RUT.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.RUT.max);
        }
        break;
      case 'telefono':
        valorFormateado = formatearInput(value, 'telefono');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.TELEFONO.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.TELEFONO.max);
        }
        break;
      case 'direccion':
        // Limitar caracteres
        if (value.length > LIMITES.DIRECCION.max) {
          valorFormateado = value.substring(0, LIMITES.DIRECCION.max);
        }
        break;
      case 'comuna':
        valorFormateado = formatearInput(value, 'nombre');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.COMUNA.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.COMUNA.max);
        }
        break;
      case 'password':
        // Limitar caracteres para contraseña
        if (value.length > LIMITES.PASSWORD.max) {
          valorFormateado = value.substring(0, LIMITES.PASSWORD.max);
        }
        break;
      case 'activa':
        // Manejar checkbox
        onChange({
          target: {
            name,
            value: checked,
            type
          }
        });
        return;
      default:
        valorFormateado = value;
    }
    
    // Llamar al onChange original con el valor formateado
    onChange({
      target: {
        name,
        value: valorFormateado,
        type
      }
    });
  };
  
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
              <label className="form-label">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre de la empresa"
                maxLength={LIMITES.EMPRESA_NOMBRE.max}
                required
                disabled={loading}
              />
              {errores.nombre && (
                <div className="invalid-feedback">
                  {errores.nombre}
                </div>
              )}
              <small className="text-muted">
                {formData.nombre.length}/{LIMITES.EMPRESA_NOMBRE.max} caracteres - Solo letras y espacios
              </small>
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="empresa@ejemplo.com"
                maxLength={LIMITES.EMAIL.max}
                required
                disabled={modoEdicion || loading} // No permitir cambiar email en edición
              />
              {errores.email && (
                <div className="invalid-feedback">
                  {errores.email}
                </div>
              )}
              {modoEdicion ? (
                <small className="form-text text-muted">
                  El email no se puede modificar una vez registrada la empresa
                </small>
              ) : (
                <small className="text-muted">
                  {formData.email.length}/{LIMITES.EMAIL.max} caracteres
                </small>
              )}
            </div>

            {/* RUT */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                RUT *
              </label>
              <input
                type="text"
                className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12345678-9"
                maxLength={LIMITES.RUT.max}
                required
                disabled={modoEdicion || loading} // No permitir cambiar RUT en edición
              />
              {errores.rut && (
                <div className="invalid-feedback">
                  {errores.rut}
                </div>
              )}
              {modoEdicion ? (
                <small className="form-text text-muted">
                  El RUT no se puede modificar una vez registrada la empresa
                </small>
              ) : (
                <small className="text-muted">
                  {formData.rut.length}/{LIMITES.RUT.max} caracteres - Solo números, K y guión
                </small>
              )}
            </div>

            {/* Teléfono */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Telefono (opcional)
              </label>
              <input
                type="tel"
                className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                maxLength={LIMITES.TELEFONO.max}
                disabled={loading}
              />
              {errores.telefono && (
                <div className="invalid-feedback">
                  {errores.telefono}
                </div>
              )}
              <small className="text-muted">
                {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres - Solo números, +, -, espacios
              </small>
            </div>

            {/* Dirección */}
            <div className="col-md-8 mb-3">
              <label className="form-label">
                Direccion (opcional)
              </label>
              <input
                type="text"
                className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle, número, depto/oficina"
                maxLength={LIMITES.DIRECCION.max}
                disabled={loading}
              />
              {errores.direccion && (
                <div className="invalid-feedback">
                  {errores.direccion}
                </div>
              )}
              <small className="text-muted">
                {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
              </small>
            </div>

            {/* Comuna */}
            <div className="col-md-4 mb-3">
              <label className="form-label">
                Comuna (opcional)
              </label>
              <input
                type="text"
                className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                id="comuna"
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                placeholder="Comuna"
                maxLength={LIMITES.COMUNA.max}
                disabled={loading}
              />
              {errores.comuna && (
                <div className="invalid-feedback">
                  {errores.comuna}
                </div>
              )}
              <small className="text-muted">
                {formData.comuna.length}/{LIMITES.COMUNA.max} caracteres - Solo letras
              </small>
            </div>

            {/* Contraseña - Solo para nuevas empresas */}
            {!modoEdicion && (
              <div className="col-12 mb-3">
                <label className="form-label">
                  Contraseña *
                </label>
                <input
                  type="password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres con letras y números"
                  maxLength={LIMITES.PASSWORD.max}
                  minLength={LIMITES.PASSWORD.min}
                  required
                  disabled={loading}
                />
                {errores.password && (
                  <div className="invalid-feedback">
                    {errores.password}
                  </div>
                )}
                <small className="text-muted">
                  {formData.password.length}/{LIMITES.PASSWORD.max} caracteres - Debe contener letras y números
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
                    onChange={handleChange}
                    disabled={loading}
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