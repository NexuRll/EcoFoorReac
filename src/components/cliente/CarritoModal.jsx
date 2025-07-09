import React, { useState, useEffect } from 'react';
import { 
  suscribirSolicitudesCliente, 
  verificarYLimpiarSolicitudesAntiguas,
  cancelarSolicitudPendiente,
  puedeCancelarSolicitud,
  obtenerTiempoTranscurrido
} from '../../services/productos/solicitudService';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const CarritoModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const cargarSolicitudes = async () => {
      setLoading(true);
      
      try {
        // Primero, limpiar solicitudes pendientes antiguas (más de 24 horas)
        const eliminadas = await verificarYLimpiarSolicitudesAntiguas(currentUser.uid);
        
        // Mostrar notificación si se eliminaron solicitudes
        if (eliminadas > 0) {
          Swal.fire({
            icon: 'info',
            title: 'Limpieza automática',
            text: `Se eliminaron ${eliminadas} solicitudes pendientes de más de 24 horas`,
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
          });
        }
        
        // Luego, suscribirse a cambios en tiempo real
        const unsubscribe = suscribirSolicitudesCliente(currentUser.uid, (solicitudesActualizadas) => {
          setSolicitudes(solicitudesActualizadas);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        setLoading(false);
      }
    };
    
    cargarSolicitudes().then(unsubscribe => {
      // Guardar la función de cleanup
      return unsubscribe;
    });
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

  const handleCancelarSolicitud = async (solicitud) => {
    const result = await Swal.fire({
      title: '¿Cancelar solicitud?',
      html: `
        <div class="text-start">
          <p><strong>Producto:</strong> ${solicitud.nombreProducto}</p>
          <p><strong>Cantidad:</strong> ${solicitud.cantidad}</p>
          <p><strong>Precio:</strong> ${solicitud.precioUnitario?.toLocaleString('es-CL')}</p>
          <p><strong>Solicitado:</strong> ${obtenerTiempoTranscurrido(solicitud.fechaSolicitud)}</p>
          <hr>
          <p class="text-muted">Esta acción:</p>
          <ul class="text-muted">
            <li>Eliminará la solicitud completamente</li>
            <li>Restaurará el stock del producto</li>
            <li>No se podrá deshacer</li>
          </ul>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar solicitud',
      cancelButtonText: 'No, mantener',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const resultado = await cancelarSolicitudPendiente(solicitud.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Solicitud cancelada',
          html: `
            <div class="text-start">
              <p><strong>Producto:</strong> ${resultado.nombreProducto}</p>
              <p><strong>Cantidad cancelada:</strong> ${resultado.cantidad}</p>
              <p class="text-success"><i class="fas fa-check-circle me-2"></i>Stock restaurado correctamente</p>
            </div>
          `,
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo cancelar la solicitud',
          confirmButtonColor: '#28a745'
        });
      }
    }
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
                          <div className="col-md-5">
                            <h6 className="card-title mb-1">
                              {solicitud.nombreProducto}
                            </h6>
                            <small className="text-muted">
                              Cantidad: {solicitud.cantidad} | 
                              Precio unitario: ${solicitud.precioUnitario?.toLocaleString('es-CL')}
                            </small>
                          </div>
                          <div className="col-md-2 text-center">
                            {getEstadoBadge(solicitud.estado)}
                          </div>
                          <div className="col-md-3 text-center">
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
                          <div className="col-md-2 text-end">
                            {puedeCancelarSolicitud(solicitud) && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancelarSolicitud(solicitud)}
                                title="Cancelar solicitud"
                              >
                                <i className="fas fa-times me-1"></i>
                                Cancelar
                              </button>
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