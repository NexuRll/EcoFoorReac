import React from 'react';

const EmptyState = ({ 
  icon = 'fas fa-inbox',
  title = 'No hay datos',
  message = 'No se encontraron elementos para mostrar',
  actionButton = null
}) => {
  return (
    <div className="text-center py-5">
      <i className={`${icon} fa-3x text-muted mb-3`}></i>
      <h5 className="text-muted">{title}</h5>
      <p className="text-muted">{message}</p>
      {actionButton && (
        <div className="mt-3">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 