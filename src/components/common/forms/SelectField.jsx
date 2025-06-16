import React from 'react';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Seleccione una opción',
  required = false,
  disabled = false,
  helpText,
  icon,
  size = 'md',
  className = '',
  multiple = false,
  ...props
}) => {
  const selectId = `select-${name}`;
  const hasError = !!error;
  
  const sizeClasses = {
    sm: 'form-select-sm',
    md: '',
    lg: 'form-select-lg'
  };

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <div className="position-relative">
        {icon && (
          <div className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ zIndex: 5 }}>
            <i className={`${icon} text-muted`}></i>
          </div>
        )}
        
        <select
          id={selectId}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          multiple={multiple}
          className={`form-select ${sizeClasses[size]} ${hasError ? 'is-invalid' : ''} ${icon ? 'ps-5' : ''}`}
          {...props}
        >
          {!multiple && placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option, index) => {
            // Soporte para diferentes formatos de opciones
            if (typeof option === 'string') {
              return (
                <option key={index} value={option}>
                  {option}
                </option>
              );
            }
            
            if (typeof option === 'object') {
              return (
                <option 
                  key={option.value || index} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label || option.text}
                </option>
              );
            }
            
            return null;
          })}
        </select>
        
        {hasError && (
          <div className="invalid-feedback">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </div>
        )}
      </div>
      
      {helpText && !hasError && (
        <div className="form-text">
          <i className="fas fa-info-circle me-1"></i>
          {helpText}
        </div>
      )}
      
      {multiple && (
        <div className="form-text">
          <small className="text-muted">
            <i className="fas fa-hand-pointer me-1"></i>
            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples opciones
          </small>
        </div>
      )}
    </div>
  );
};

export default SelectField; 