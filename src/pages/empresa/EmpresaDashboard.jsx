import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productoService } from '../../services/productos/productoService';
import { isNearExpiration, isExpired, formatDate } from '../../utils/helpers/dateUtils';
import { PRODUCT_STATUS } from '../../utils/constants/validationRules';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';

const EmpresaDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosDisponibles: 0,
    productosPorVencer: 0,
    productosVencidos: 0,
    productosAgotados: 0
  });
  const [alertas, setAlertas] = useState([]);

  // Determinar estado de un producto
  const determinarEstadoProducto = (producto) => {
    if (producto.cantidad === 0) return PRODUCT_STATUS.AGOTADO;
    if (isExpired(producto.vencimiento)) return PRODUCT_STATUS.VENCIDO;
    if (isNearExpiration(producto.vencimiento, 3)) return PRODUCT_STATUS.POR_VENCER;
    return PRODUCT_STATUS.DISPONIBLE;
  };

  // Cargar estadísticas reales
  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const productos = await productoService.obtenerTodosLosProductos(currentUser.uid);
      
      // Calcular estadísticas reales
      const estadisticas = {
        totalProductos: productos.length,
        productosDisponibles: 0,
        productosPorVencer: 0,
        productosVencidos: 0,
        productosAgotados: 0
      };

      const alertasGeneradas = [];

      productos.forEach(producto => {
        const estado = determinarEstadoProducto(producto);
        
        // Contar por estado
        switch (estado) {
          case PRODUCT_STATUS.DISPONIBLE:
            estadisticas.productosDisponibles++;
            break;
          case PRODUCT_STATUS.POR_VENCER:
            estadisticas.productosPorVencer++;
            break;
          case PRODUCT_STATUS.VENCIDO:
            estadisticas.productosVencidos++;
            break;
          case PRODUCT_STATUS.AGOTADO:
            estadisticas.productosAgotados++;
            break;
        }
      });

      // Generar alertas solo si hay problemas reales
      if (estadisticas.productosPorVencer > 0) {
        alertasGeneradas.push({
          tipo: 'warning',
          mensaje: `${estadisticas.productosPorVencer} producto(s) vencen pronto`,
        });
      }

      if (estadisticas.productosVencidos > 0) {
        alertasGeneradas.push({
          tipo: 'danger',
          mensaje: `${estadisticas.productosVencidos} producto(s) vencidos`,
        });
      }

      if (estadisticas.productosAgotados > 0) {
        alertasGeneradas.push({
          tipo: 'info',
          mensaje: `${estadisticas.productosAgotados} producto(s) agotados`,
        });
      }

      setStats(estadisticas);
      setAlertas(alertasGeneradas);

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Mantener valores por defecto en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      cargarEstadisticas();
    }
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="container-fluid">
      {/* Header del Dashboard */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 text-success">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard Empresarial
              </h1>
              <p className="text-muted mb-0">
                Resumen de tu inventario de productos
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Actualizado: {formatDate(new Date())}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Reales */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Productos
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalProductos}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-box fa-2x text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Disponibles
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.productosDisponibles}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Por Vencer
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.productosPorVencer}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-exclamation-triangle fa-2x text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Vencidos
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.productosVencidos}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-times-circle fa-2x text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Principales */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-light">
              <h6 className="m-0 font-weight-bold text-dark">
                <i className="fas fa-tools me-2"></i>
                Acciones Principales
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <Link 
                    to="/empresa/productos" 
                    className="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 text-decoration-none"
                  >
                    <i className="fas fa-plus fa-2x mb-2"></i>
                    <span>Gestionar Productos</span>
                  </Link>
                </div>
                <div className="col-md-4 mb-3">
                  <Link 
                    to="/empresa/perfil" 
                    className="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 text-decoration-none"
                  >
                    <i className="fas fa-edit fa-2x mb-2"></i>
                    <span>Editar Perfil</span>
                  </Link>
                </div>
                <div className="col-md-4 mb-3">
                  <button 
                    className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                    onClick={cargarEstadisticas}
                  >
                    <i className="fas fa-sync-alt fa-2x mb-2"></i>
                    <span>Actualizar Datos</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas solo si hay problemas reales */}
      {alertas.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-warning text-white">
                <h6 className="m-0 font-weight-bold">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Atención Requerida
                </h6>
              </div>
              <div className="card-body">
                {alertas.map((alerta, index) => (
                  <div key={index} className={`alert alert-${alerta.tipo} mb-2`}>
                    <i className={`fas ${
                      alerta.tipo === 'warning' ? 'fa-clock' :
                      alerta.tipo === 'danger' ? 'fa-times-circle' :
                      'fa-info-circle'
                    } me-2`}></i>
                    {alerta.mensaje}
                  </div>
                ))}
                <div className="mt-3">
                  <Link to="/empresa/productos" className="btn btn-warning btn-sm">
                    <i className="fas fa-eye me-2"></i>
                    Revisar Productos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {stats.totalProductos === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <i className="fas fa-box-open fa-4x text-muted mb-4"></i>
                <h4 className="text-muted mb-3">No tienes productos registrados</h4>
                <p className="text-muted mb-4">
                  Comienza agregando productos a tu inventario para gestionar tu negocio ecológico
                </p>
                <Link to="/empresa/productos" className="btn btn-success btn-lg">
                  <i className="fas fa-plus me-2"></i>
                  Agregar Primer Producto
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .border-left-success {
          border-left: 0.25rem solid #28a745 !important;
        }
        .border-left-primary {
          border-left: 0.25rem solid #007bff !important;
        }
        .border-left-warning {
          border-left: 0.25rem solid #ffc107 !important;
        }
        .border-left-danger {
          border-left: 0.25rem solid #dc3545 !important;
        }
      `}</style>
    </div>
  );
};

export default EmpresaDashboard; 