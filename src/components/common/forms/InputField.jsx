import React from 'react';

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  pattern,
  helpText,
  icon,
  size = 'md',
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  const hasError = !!error;
  
  const sizeClasses = {
    sm: 'form-control-sm',
    md: '',
    lg: 'form-control-lg'
  };

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <div className="position-relative">
        {icon && (
          <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
            <i className={`${icon} text-muted`}></i>
          </div>
        )}
        
        <input
          id={inputId}
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={`form-control ${sizeClasses[size]} ${hasError ? 'is-invalid' : ''} ${icon ? 'ps-5' : ''}`}
          {...props}
        />
        
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
      
      {maxLength && (
        <div className="form-text text-end">
          <small className={`${value?.length > maxLength * 0.9 ? 'text-warning' : 'text-muted'}`}>
            {value?.length || 0}/{maxLength}
          </small>
        </div>
      )}
    </div>
  );
};

export default InputField; 