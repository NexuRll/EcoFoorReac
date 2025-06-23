import React, { useState, useEffect } from 'react';
import { suscribirSolicitudesCliente } from '../../services/productos/solicitudService';
import { useAuth } from '../../context/AuthContext';

const CarritoModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    setLoading(true);
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = suscribirSolicitudesCliente(currentUser.uid, (solicitudesActualizadas) => {
      setSolicitudes(solicitudesActualizadas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    if (filtroEstado === 'todos') return true;
    return solicitud.estado === filtroEstado;
  });

  const contarPorEstado = (estado) => {
    return solicitudes.filter(s => s.estado === estado).length;
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <span className="badge bg-warning">Pendiente</span>;
      case 'aprobado':
        return <span className="badge bg-success">Aprobado</span>;
      case 'rechazado':
        return <span className="badge bg-danger">Rechazado</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-shopping-cart me-2"></i>
              Mi Carrito de Solicitudes
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Filtros */}
            <div className="row mb-3">
              <div className="col-md-8">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${filtroEstado === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroEstado('todos')}
                  >
                    Todos ({solicitudes.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-warning ${filtroEstado === 'pendiente' ? 'active' : ''}`}
                    onClick={() => setFiltroEstado('pendiente')}
                  >
                    Pendientes ({contarPorEstado('pendiente')})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-success ${filtroEstado === 'aprobado' ? 'active' : ''}`}
                    onClick={() => setFiltroEstado('aprobado')}
                  >
                    Aprobados ({contarPorEstado('aprobado')})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-danger ${filtroEstado === 'rechazado' ? 'active' : ''}`}
                    onClick={() => setFiltroEstado('rechazado')}
                  >
                    Rechazados ({contarPorEstado('rechazado')})
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de solicitudes */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando solicitudes...</p>
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">
                  {filtroEstado === 'todos' 
                    ? 'No tienes solicitudes aún' 
                    : `No tienes solicitudes ${filtroEstado}s`
                  }
                </h5>
                <p className="text-muted">
                  Ve a la sección de productos para agregar productos a tu carrito
                </p>
              </div>
            ) : (
              <div className="row">
                {solicitudesFiltradas.map((solicitud) => (
                  <div key={solicitud.id} className="col-12 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <h6 className="card-title mb-1">
                              {solicitud.nombreProducto}
                            </h6>
                            <small className="text-muted">
                              Cantidad: {solicitud.cantidad} | 
                              Precio unitario: ${solicitud.precioUnitario?.toLocaleString('es-CL')}
                            </small>
                          </div>
                          <div className="col-md-3 text-center">
                            {getEstadoBadge(solicitud.estado)}
                          </div>
                          <div className="col-md-3 text-end">
                            <small className="text-muted">
                              {formatearFecha(solicitud.fechaSolicitud)}
                            </small>
                            {solicitud.fechaRespuesta && (
                              <br />
                            )}
                            {solicitud.fechaRespuesta && (
                              <small className="text-muted">
                                Resp: {formatearFecha(solicitud.fechaRespuesta)}
                              </small>
                            )}
                          </div>
                        </div>
                        
                        {solicitud.estado === 'aprobado' && (
                          <div className="mt-2">
                            <div className="alert alert-success py-2 mb-0">
                              <i className="fas fa-check-circle me-2"></i>
                              <strong>¡Solicitud aprobada!</strong> La empresa confirmó tu pedido.
                            </div>
                          </div>
                        )}
                        
                        {solicitud.estado === 'rechazado' && (
                          <div className="mt-2">
                            <div className="alert alert-danger py-2 mb-0">
                              <i className="fas fa-times-circle me-2"></i>
                              <strong>Solicitud rechazada.</strong> La empresa no pudo procesar tu pedido.
                            </div>
                          </div>
                        )}
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
            {contarPorEstado('aprobado') > 0 && (
              <button type="button" className="btn btn-success">
                <i className="fas fa-download me-2"></i>
                Descargar Aprobados ({contarPorEstado('aprobado')})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoModal; 