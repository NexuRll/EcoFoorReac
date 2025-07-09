import React from 'react';
import SelectorPaisComunaAPI from '../../common/SelectorPaisComunaAPI';
import LoadingSpinner from '../../common/ui/LoadingSpinner';
import { formatearInput, LIMITES } from '../../../utils/validaciones';

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
  // Función para manejar cambios con validación en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;
    
    // Aplicar formato según el tipo de campo
    switch (name) {
      case 'nombre':
        valorFormateado = formatearInput(value, 'nombre');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.NOMBRE.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.NOMBRE.max);
        }
        break;
      case 'correo':
        valorFormateado = formatearInput(value, 'correo');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.EMAIL.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.EMAIL.max);
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
        valorFormateado = formatearInput(value, 'direccion');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.DIRECCION.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.DIRECCION.max);
        }
        break;
      case 'password':
        // Limitar caracteres para contraseña
        if (value.length > LIMITES.PASSWORD.max) {
          valorFormateado = value.substring(0, LIMITES.PASSWORD.max);
        }
        break;
      case 'pais':
      case 'comuna':
        // Para país y comuna, formatear como nombres
        valorFormateado = formatearInput(value, 'pais');
        break;
      default:
        valorFormateado = value;
    }
    
    // Llamar al onChange original con el valor formateado
    onChange({
      target: {
        name,
        value: valorFormateado
      }
    });
  };
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
        
        <form onSubmit={onSubmit} autoComplete="off">
          <div className="row">
            {/* Nombre */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre completo"
                maxLength={LIMITES.NOMBRE.max}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              <small className="text-muted">
                {formData.nombre.length}/{LIMITES.NOMBRE.max} caracteres - Solo letras y espacios
              </small>
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
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                maxLength={LIMITES.EMAIL.max}
                disabled={loading || isEditing} // No permitir editar email
                  autoComplete="new-password"
                  required
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
              {isEditing ? (
                <div className="form-text text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  El email no se puede modificar por seguridad
                </div>
              ) : (
                <small className="text-muted">
                  {formData.correo.length}/{LIMITES.EMAIL.max} caracteres
                </small>
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
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  maxLength={LIMITES.PASSWORD.max}
                  minLength={LIMITES.PASSWORD.min}
                  disabled={loading}
                  required
                />
                {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                <small className="text-muted">
                  {formData.password.length}/{LIMITES.PASSWORD.max} caracteres - Debe contener letras y números
                </small>
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
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                maxLength={LIMITES.TELEFONO.max}
                disabled={loading}
                autoComplete="new-password"
              />
              {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
              <small className="text-muted">
                {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres - Solo números, +, -, espacios
              </small>
            </div>
          </div>

          {/* Selector de País y Comuna */}
          <SelectorPaisComunaAPI
            paisSeleccionado={formData.pais}
            comunaSeleccionada={formData.comuna}
            onPaisChange={(pais) => handleChange({ target: { name: 'pais', value: pais } })}
            onComunaChange={(comuna) => handleChange({ target: { name: 'comuna', value: comuna } })}
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
              onChange={handleChange}
              placeholder="Dirección completa (opcional)"
              rows="2"
              maxLength={LIMITES.DIRECCION.max}
              disabled={loading}
              autoComplete="new-password"
            />
            {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
            <small className="text-muted">
              {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
            </small>
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