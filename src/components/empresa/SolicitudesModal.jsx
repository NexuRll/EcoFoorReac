import React, { useState, useEffect } from 'react';
import { suscribirSolicitudesEmpresa, responderSolicitud } from '../../services/productos/solicitudService';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const SolicitudesModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    setLoading(true);
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = suscribirSolicitudesEmpresa(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudes(solicitudesActualizadas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRespuesta = async (solicitudId, accion, solicitud) => {
    const esAprobacion = accion === 'aprobado';
    
    const result = await Swal.fire({
      title: esAprobacion ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?',
      html: `
        <div class="text-start">
          <p><strong>Cliente solicita:</strong></p>
          <ul>
            <li><strong>Producto:</strong> ${solicitud.nombreProducto}</li>
            <li><strong>Cantidad:</strong> ${solicitud.cantidad} unidades</li>
            <li><strong>Precio unitario:</strong> $${solicitud.precioUnitario?.toLocaleString('es-CL') || '0'}</li>
            <li><strong>Total:</strong> $${((solicitud.precioUnitario || 0) * solicitud.cantidad).toLocaleString('es-CL')}</li>
          </ul>
          <hr>
          <p class="text-muted">
            ${esAprobacion 
              ? `✅ Al aprobar, se descontarán <strong>${solicitud.cantidad} unidades</strong> del stock del producto.<br/>
                 💰 El cliente podrá proceder con la compra.` 
              : '❌ Al rechazar, se notificará al cliente que la solicitud no fue aceptada.<br/>📦 El stock permanecerá sin cambios.'
            }
          </p>
        </div>
      `,
      icon: esAprobacion ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: esAprobacion ? 'Sí, Aprobar y Descontar Stock' : 'Sí, Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: esAprobacion ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      try {
        setProcesando(solicitudId);
        await responderSolicitud(solicitudId, accion);
        
        Swal.fire({
          icon: 'success',
          title: esAprobacion ? '¡Solicitud Aprobada!' : 'Solicitud Rechazada',
          html: esAprobacion 
            ? `<div class="text-center">
                 <p>La solicitud ha sido <strong>aprobada</strong> exitosamente.</p>
                 <div class="alert alert-info mt-3">
                   <i class="fas fa-info-circle me-2"></i>
                   <strong>Stock actualizado:</strong><br/>
                   Se han descontado <strong>${solicitud.cantidad} unidades</strong> del producto "${solicitud.nombreProducto}"
                 </div>
               </div>`
            : 'La solicitud ha sido rechazada. El cliente será notificado.',
          timer: esAprobacion ? 4000 : 2000,
          showConfirmButton: esAprobacion,
          confirmButtonText: 'Entendido'
        });
      } catch (error) {
        console.error('Error al responder solicitud:', error);
        
        // Mostrar error específico si es un problema de stock
        const mensajeError = error.message.includes('Stock insuficiente') 
          ? `⚠️ ${error.message}<br/><br/>Por favor, verifica el stock actual del producto.`
          : 'No se pudo procesar la respuesta. Inténtalo de nuevo.';
          
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar solicitud',
          html: mensajeError,
          confirmButtonColor: '#dc3545'
        });
      } finally {
        setProcesando(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              <i className="fas fa-bell me-2"></i>
              Solicitudes Pendientes
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando solicitudes...</p>
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No hay solicitudes pendientes</h5>
                <p className="text-muted">
                  Cuando los clientes soliciten tus productos, aparecerán aquí para que puedas aprobarlas o rechazarlas.
                </p>
                <div className="alert alert-info mt-3">
                  <strong>💡 Recuerda:</strong>
                  <ul className="mb-0 text-start mt-2">
                    <li>✅ Al <strong>aprobar</strong> una solicitud, se descuenta automáticamente del stock</li>
                    <li>❌ Al <strong>rechazar</strong> una solicitud, el stock permanece sin cambios</li>
                    <li>📦 Si el stock llega a cero, el producto se marcará como "agotado"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="row">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="col-12 mb-3">
                    <div className="card border-warning">
                      <div className="card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">
                            <i className="fas fa-clock me-2 text-warning"></i>
                            Solicitud Pendiente
                          </h6>
                          <small className="text-muted">
                            Recibida: {formatearFecha(solicitud.fechaSolicitud)}
                          </small>
                        </div>
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-hourglass-half me-1"></i>
                          Pendiente
                        </span>
                      </div>
                      
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <h5 className="card-title mb-2">
                              <i className="fas fa-box me-2 text-success"></i>
                              {solicitud.nombreProducto}
                            </h5>
                            <div className="mb-2">
                              <span className="badge bg-info me-2">
                                <i className="fas fa-cubes me-1"></i>
                                Cantidad: {solicitud.cantidad}
                              </span>
                              <span className="badge bg-success">
                                <i className="fas fa-dollar-sign me-1"></i>
                                ${solicitud.precioUnitario?.toLocaleString('es-CL') || '0'} c/u
                              </span>
                            </div>
                            <p className="text-muted mb-2">
                              <strong>Total de la solicitud:</strong> 
                              <span className="text-success ms-1">
                                ${((solicitud.precioUnitario || 0) * solicitud.cantidad).toLocaleString('es-CL')}
                              </span>
                            </p>
                            <small className="text-info">
                              <i className="fas fa-info-circle me-1"></i>
                              Al aprobar se descontarán {solicitud.cantidad} unidades del stock
                            </small>
                          </div>
                          
                          <div className="col-md-6 text-end">
                            <div className="btn-group" role="group">
                              <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => handleRespuesta(solicitud.id, 'aprobado', solicitud)}
                                disabled={procesando === solicitud.id}
                              >
                                {procesando === solicitud.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-check me-2"></i>
                                    Aprobar
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => handleRespuesta(solicitud.id, 'rechazado', solicitud)}
                                disabled={procesando === solicitud.id}
                              >
                                <i className="fas fa-times me-2"></i>
                                Rechazar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            {solicitudes.length > 0 && (
              <span className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                {solicitudes.length} solicitud(es) pendiente(s)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesModal; 