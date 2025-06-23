import React, { useState } from 'react';
import { formatDate, isNearExpiration, isExpired } from '../../utils/helpers/dateUtils';
import { PRODUCT_STATUS_LABELS } from '../../utils/constants/validationRules';
import Swal from 'sweetalert2';

const ProductoCardCliente = ({ 
  producto, 
  empresa,
  onSolicitar 
}) => {
  const [loading, setLoading] = useState(false);

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
  const isDisponible = status === 'disponible' || status === 'por_vencer';

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

  const handleSolicitar = async () => {
    if (!isDisponible || loading) return;

    try {
      // Modal para seleccionar cantidad con validación mejorada
      const { value: cantidad } = await Swal.fire({
        title: '¿Cuánto necesitas?',
        html: `
          <div class="text-start">
            <p><strong>Producto:</strong> ${producto.nombre}</p>
            <p><strong>Empresa:</strong> ${empresa?.nombre || 'No especificada'}</p>
            <p><strong>Precio:</strong> ${isGratuito ? 'Gratis' : `$${producto.precio?.toLocaleString('es-CL')}`}</p>
            <p class="text-info"><strong>📦 Stock disponible:</strong> ${producto.cantidad} unidades</p>
            <hr>
            <label for="cantidad" class="form-label">Cantidad a solicitar (máximo ${producto.cantidad}):</label>
          </div>
        `,
        input: 'number',
        inputAttributes: {
          min: 1,
          max: producto.cantidad,
          step: 1,
          class: 'form-control',
          id: 'cantidad',
          placeholder: `Ingresa entre 1 y ${producto.cantidad}`
        },
        inputValue: 1,
        showCancelButton: true,
        confirmButtonText: 'Agregar al Carrito',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: (value) => {
          const num = parseInt(value);
          
          // Validación exhaustiva
          if (!value || value.trim() === '') {
            Swal.showValidationMessage('Por favor ingresa una cantidad');
            return false;
          }
          
          if (isNaN(num)) {
            Swal.showValidationMessage('La cantidad debe ser un número válido');
            return false;
          }
          
          if (num < 1) {
            Swal.showValidationMessage('La cantidad debe ser mayor a 0');
            return false;
          }
          
          if (num > producto.cantidad) {
            Swal.showValidationMessage(`⚠️ Solo hay ${producto.cantidad} unidades disponibles. No puedes solicitar ${num} unidades.`);
            return false;
          }
          
          // Si llegamos aquí, la validación es exitosa
          return num;
        },
        inputValidator: (value) => {
          const num = parseInt(value);
          if (!value || isNaN(num)) {
            return 'Ingresa una cantidad válida';
          }
          if (num < 1) {
            return 'La cantidad debe ser mayor a 0';
          }
          if (num > producto.cantidad) {
            return `⚠️ Solo hay ${producto.cantidad} unidades disponibles`;
          }
        }
      });

      if (cantidad) {
        // Validación adicional por seguridad antes de enviar
        const cantidadFinal = parseInt(cantidad);
        
        if (cantidadFinal > producto.cantidad) {
          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: `No puedes solicitar ${cantidadFinal} unidades. Solo hay ${producto.cantidad} disponibles.`,
            confirmButtonColor: '#dc3545'
          });
          return;
        }

        setLoading(true);
        
        const solicitudData = {
          clienteId: null, // Se establecerá en el servicio
          empresaId: empresa?.id || producto.empresaId,
          productoId: producto.id,
          cantidad: cantidadFinal,
          nombreProducto: producto.nombre,
          precioUnitario: producto.precio || 0
        };

        await onSolicitar(solicitudData);
        
        // Mostrar confirmación
        await Swal.fire({
          icon: 'success',
          title: '¡Agregado al carrito!',
          html: `
            <div class="text-center">
              <p><strong>${cantidadFinal} unidad(es)</strong> de <strong>${producto.nombre}</strong></p>
              <p class="text-muted">agregadas a tu carrito exitosamente</p>
              <small class="text-info">📦 Quedan ${producto.cantidad - cantidadFinal} unidades disponibles</small>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
          allowOutsideClick: true
        });
      }
    } catch (error) {
      console.error('Error al solicitar producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito. Inténtalo de nuevo.',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className={`card h-100 shadow-sm ${!isDisponible ? 'opacity-75' : ''}`}>
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
            <i className="fas fa-seedling me-2 text-success"></i>
            {producto.nombre}
          </h5>

          {/* Información de la empresa */}
          {empresa && (
            <div className="empresa-info mb-2">
              <small className="text-muted">
                <i className="fas fa-store me-1"></i>
                <strong>{empresa.nombre}</strong>
              </small>
              {empresa.comuna && (
                <small className="text-muted d-block">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {empresa.comuna}
                </small>
              )}
            </div>
          )}

          {/* Descripción */}
          <p className="card-text text-muted flex-grow-1">
            {producto.descripcion?.length > 80 
              ? `${producto.descripcion.substring(0, 80)}...` 
              : producto.descripcion || 'Sin descripción'}
          </p>

          {/* Información del producto */}
          <div className="product-info mb-3">
            <div className="row text-center">
              <div className="col-4">
                <div className="info-item">
                  <i className="fas fa-cubes text-primary"></i>
                  <div className="mt-1">
                    <strong>{producto.cantidad}</strong>
                    <br />
                    <small className="text-muted">Disponible</small>
                  </div>
                </div>
              </div>
              <div className="col-4">
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
              <div className="col-4">
                <div className="info-item">
                  <i className="fas fa-calendar-alt text-warning"></i>
                  <div className="mt-1">
                    <strong>
                      {daysToExpiration !== null ? 
                        (daysToExpiration <= 0 ? 'Vencido' : `${daysToExpiration}d`) : 
                        'N/A'
                      }
                    </strong>
                    <br />
                    <small className="text-muted">Vence en</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div className="vencimiento-info mb-3">
            <small className="text-muted">
              <i className="fas fa-clock me-1"></i>
              Vence: {formatDate(producto.vencimiento)}
            </small>
            {status === 'por_vencer' && daysToExpiration <= 3 && (
              <div className="alert alert-warning py-1 px-2 mt-1 mb-0">
                <small>
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  ¡Vence pronto!
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Footer con acción */}
        <div className="card-footer bg-light">
          {isDisponible ? (
            <button
              type="button"
              className="btn btn-success w-100"
              onClick={handleSolicitar}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <i className="fas fa-cart-plus me-2"></i>
                  Agregar al Carrito
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary w-100"
              disabled
            >
              <i className="fas fa-ban me-2"></i>
              No Disponible
            </button>
          )}
        </div>
      </div>

      <style>{`
        .info-item {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: #f8f9fa;
        }
        .info-item i {
          font-size: 1.1rem;
        }
        .product-info .info-item:hover {
          background-color: #e9ecef;
          transition: background-color 0.2s;
        }
        .card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid #28a745;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
        }
        .empresa-info {
          background-color: #f8f9fa;
          padding: 0.5rem;
          border-radius: 0.25rem;
          border-left: 3px solid #28a745;
        }
        .vencimiento-info .alert {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default ProductoCardCliente; 