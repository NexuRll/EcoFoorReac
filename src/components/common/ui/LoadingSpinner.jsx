import React from 'react';

const LoadingSpinner = ({ 
  size = 'normal', 
  text = 'Cargando...', 
  color = 'primary',
  center = true 
}) => {
  const sizeClass = size === 'small' ? 'spinner-border-sm' : '';
  
  const spinnerComponent = (
    <div className={`spinner-border text-${color} ${sizeClass}`} role="status">
      <span className="visually-hidden">{text}</span>
    </div>
  );

  if (center) {
    return (
      <div className="text-center py-4">
        {spinnerComponent}
        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <>
      {spinnerComponent}
      {text && <span className="ms-2">{text}</span>}
    </>
  );
};

export default LoadingSpinner; 