import React from 'react';
import { formatDate, isNearExpiration, isExpired } from '../../utils/helpers/dateUtils';
import { PRODUCT_STATUS_LABELS } from '../../utils/constants/validationRules';

const ProductoCard = ({ 
  producto, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true 
}) => {
  if (!producto) return null;

  // Determinar estado del producto
  const getProductStatus = () => {
    if (producto.cantidad === 0) return 'agotado';
    if (isExpired(producto.vencimiento)) return 'vencido';
    if (isNearExpiration(producto.vencimiento, 3)) return 'por_vencer';
    return 'disponible';
  };

  const status = getProductStatus();
  const statusInfo = PRODUCT_STATUS_LABELS[status];
  const isGratuito = producto.precio === 0;

  // Calcular días hasta vencimiento
  const getDaysToExpiration = () => {
    if (!producto.vencimiento) return null;
    const today = new Date();
    const expDate = new Date(producto.vencimiento);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToExpiration = getDaysToExpiration();

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className={`card h-100 shadow-sm border-${statusInfo.color}`}>
        {/* Header de la tarjeta */}
        <div className={`card-header bg-${statusInfo.color} text-white d-flex justify-content-between align-items-center`}>
          <div className="d-flex align-items-center">
            <i className={`fas ${statusInfo.icon} me-2`}></i>
            <span className="badge bg-light text-dark">
              {statusInfo.label}
            </span>
          </div>
          {isGratuito && (
            <span className="badge bg-warning text-dark">
              <i className="fas fa-gift me-1"></i>
              GRATIS
            </span>
          )}
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="card-body d-flex flex-column">
          {/* Nombre del producto */}
          <h5 className="card-title text-truncate" title={producto.nombre}>
            <i className="fas fa-box me-2 text-muted"></i>
            {producto.nombre}
          </h5>

          {/* Descripción */}
          <p className="card-text text-muted flex-grow-1">
            {producto.descripcion?.length > 100 
              ? `${producto.descripcion.substring(0, 100)}...` 
              : producto.descripcion || 'Sin descripción'}
          </p>

          {/* Información del producto */}
          <div className="product-info mb-3">
            <div className="row text-center">
              <div className="col-6">
                <div className="info-item">
                  <i className="fas fa-cubes text-primary"></i>
                  <div className="mt-1">
                    <strong>{producto.cantidad}</strong>
                    <br />
                    <small className="text-muted">Cantidad</small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="info-item">
                  <i className="fas fa-dollar-sign text-success"></i>
                  <div className="mt-1">
                    <strong>
                      {isGratuito ? 'Gratis' : `$${producto.precio?.toLocaleString()}`}
                    </strong>
                    <br />
                    <small className="text-muted">Precio</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div className="vencimiento-info mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-muted">
                <i className="fas fa-calendar-alt me-1"></i>
                Vence:
              </span>
              <span className={`badge ${
                status === 'vencido' ? 'bg-danger' : 
                status === 'por_vencer' ? 'bg-warning text-dark' : 'bg-light text-dark'
              }`}>
                {formatDate(producto.vencimiento)}
              </span>
            </div>
            
            {/* Advertencia de vencimiento */}
            {daysToExpiration !== null && (
              <div className="mt-2">
                {daysToExpiration < 0 ? (
                  <div className="alert alert-danger py-1 px-2 mb-0">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    <small>Vencido hace {Math.abs(daysToExpiration)} días</small>
                  </div>
                ) : daysToExpiration <= 3 ? (
                  <div className="alert alert-warning py-1 px-2 mb-0">
                    <i className="fas fa-clock me-1"></i>
                    <small>
                      {daysToExpiration === 0 ? 'Vence hoy' : 
                       daysToExpiration === 1 ? 'Vence mañana' : 
                       `Vence en ${daysToExpiration} días`}
                    </small>
                  </div>
                ) : (
                  <div className="alert alert-info py-1 px-2 mb-0">
                    <i className="fas fa-info-circle me-1"></i>
                    <small>Vence en {daysToExpiration} días</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="metadata text-muted">
            <small>
              <i className="fas fa-clock me-1"></i>
              Creado: {formatDate(producto.fechaCreacion)}
            </small>
            {producto.fechaActualizacion && (
              <small className="d-block">
                <i className="fas fa-edit me-1"></i>
                Actualizado: {formatDate(producto.fechaActualizacion)}
              </small>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        {showActions && (
          <div className="card-footer bg-light">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => onView && onView(producto)}
                title="Ver detalles"
              >
                <i className="fas fa-eye"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => onEdit && onEdit(producto)}
                title="Editar producto"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete && onDelete(producto)}
                title="Eliminar producto"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .info-item {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: #f8f9fa;
        }
        .info-item i {
          font-size: 1.2rem;
        }
        .product-info .info-item:hover {
          background-color: #e9ecef;
          transition: background-color 0.2s;
        }
        .card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
        }
        .vencimiento-info .alert {
          font-size: 0.75rem;
        }
        .metadata {
          font-size: 0.75rem;
          border-top: 1px solid #dee2e6;
          padding-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ProductoCard; 