import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductoCardCliente from '../../components/productos/ProductoCardCliente';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import EmptyState from '../../components/common/ui/EmptyState';
import { productoService } from '../../services/productos/productoService';
import { empresaService } from '../../services/empresa/empresaFirebase';
import { crearSolicitudProducto } from '../../services/productos/solicitudService';
import useDebounce from '../../hooks/common/useDebounce';
import Swal from 'sweetalert2';

const ProductosCliente = () => {
  const { currentUser, userType, userData } = useAuth();
  
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [empresas, setEmpresas] = useState({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(busqueda, 300);

  // Filtrar productos por búsqueda
  const productosFiltrados = useMemo(() => {
    if (!debouncedSearch) return productos;

    const searchLower = debouncedSearch.toLowerCase();
    return productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.descripcion?.toLowerCase().includes(searchLower) ||
      empresas[producto.empresaId]?.nombre?.toLowerCase().includes(searchLower)
    );
  }, [productos, debouncedSearch, empresas]);

  // Cargar productos y empresas
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar productos públicos
      const productosData = await productoService.obtenerProductosPublicos({ limite: 100 });
      setProductos(productosData);

      // Obtener IDs únicos de empresas
      const empresaIds = [...new Set(productosData.map(p => p.empresaId))];
      
      // Cargar información de empresas
      const empresasData = {};
      await Promise.all(
        empresaIds.map(async (empresaId) => {
          try {
            const empresa = await empresaService.obtenerEmpresaPorId(empresaId);
            empresasData[empresaId] = empresa;
          } catch (error) {
            console.warn(`No se pudo cargar empresa ${empresaId}:`, error);
            empresasData[empresaId] = { nombre: 'Empresa no disponible' };
          }
        })
      );
      
      setEmpresas(empresasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejar solicitud de producto (integrado con el nuevo sistema)
  const handleSolicitarProducto = async (solicitudData) => {
    try {
      if (!currentUser) {
        Swal.fire({
          icon: 'warning',
          title: 'Acceso requerido',
          text: 'Debes iniciar sesión para solicitar productos',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Completar datos de la solicitud
      const solicitudCompleta = {
        ...solicitudData,
        clienteId: currentUser.uid
      };

      // Crear la solicitud en Firestore
      await crearSolicitudProducto(solicitudCompleta);

      // La confirmación se muestra en ProductoCardCliente
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw error; // Re-lanzar para que ProductoCardCliente lo maneje
    }
  };

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Error al cargar productos</h4>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando productos disponibles..." />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 text-success">
                <i className="fas fa-shopping-basket me-2"></i>
                Productos Disponibles
              </h1>
              <p className="text-muted mb-0">
                Descubre productos ecológicos frescos de empresas locales
              </p>
            </div>
            <div className="text-end">
              <span className="badge bg-success fs-6">
                {productosFiltrados.length} productos disponibles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="input-group">
                <span className="input-group-text bg-success text-white">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar productos o empresas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setBusqueda('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {productosFiltrados.length === 0 ? (
        <EmptyState
          icon="fas fa-search"
          title={busqueda ? "No se encontraron productos" : "No hay productos disponibles"}
          description={
            busqueda 
              ? `No se encontraron productos que coincidan con "${busqueda}"`
              : "Actualmente no hay productos disponibles para mostrar"
          }
          actionButton={
            busqueda ? (
              <button 
                className="btn btn-success"
                onClick={() => setBusqueda('')}
              >
                <i className="fas fa-refresh me-2"></i>
                Ver todos los productos
              </button>
            ) : (
              <button 
                className="btn btn-success"
                onClick={cargarDatos}
              >
                <i className="fas fa-refresh me-2"></i>
                Recargar productos
              </button>
            )
          }
        />
      ) : (
        <div className="row">
          {productosFiltrados.map((producto) => (
            <ProductoCardCliente
              key={producto.id}
              producto={producto}
              empresa={empresas[producto.empresaId]}
              onSolicitar={handleSolicitarProducto}
            />
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title text-success">
                <i className="fas fa-info-circle me-2"></i>
                ¿Cómo funciona?
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <i className="fas fa-search fa-2x text-success mb-2"></i>
                  <h6>1. Explora</h6>
                  <p className="text-muted small">
                    Busca productos ecológicos de empresas locales
                  </p>
                </div>
                <div className="col-md-4 mb-3">
                  <i className="fas fa-cart-plus fa-2x text-success mb-2"></i>
                  <h6>2. Solicita</h6>
                  <p className="text-muted small">
                    Agrega productos a tu carrito y envía tu solicitud
                  </p>
                </div>
                <div className="col-md-4 mb-3">
                  <i className="fas fa-handshake fa-2x text-success mb-2"></i>
                  <h6>3. Conecta</h6>
                  <p className="text-muted small">
                    La empresa revisará tu solicitud y se pondrá en contacto contigo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosCliente; 