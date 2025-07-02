import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductoCard from '../../components/productos/ProductoCard';
import ProductoModal from '../../components/productos/ProductoModal';
import ProductosFilters from '../../components/productos/ProductosFilters';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import EmptyState from '../../components/common/ui/EmptyState';
import usePagination from '../../hooks/common/usePagination';
import useDebounce from '../../hooks/common/useDebounce';
import { productoService } from '../../services/productos/productoService';
import { isNearExpiration, isExpired } from '../../utils/helpers/dateUtils';
import { PRODUCT_STATUS } from '../../utils/constants/validationRules';
import Swal from 'sweetalert2';

const ProductosEmpresa = () => {
  const { currentUser } = useAuth();
  
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    disponibles: 0,
    porVencer: 0,
    vencidos: 0,
    agotados: 0,
    gratuitos: 0
  });

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    search: '',
    status: '',
    sortBy: 'nombre_asc',
    itemsPerPage: 10
  });

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(filtros.search, 300);

  // Determinar estado de un producto
  const determinarEstadoProducto = (producto) => {
    if (producto.cantidad === 0) return PRODUCT_STATUS.AGOTADO;
    if (isExpired(producto.vencimiento)) return PRODUCT_STATUS.VENCIDO;
    if (isNearExpiration(producto.vencimiento, 3)) return PRODUCT_STATUS.POR_VENCER;
    return PRODUCT_STATUS.DISPONIBLE;
  };

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // Aplicar filtro de búsqueda
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      resultado = resultado.filter(producto =>
        producto.nombre.toLowerCase().includes(searchLower) ||
        producto.descripcion?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de estado
    if (filtros.status) {
      resultado = resultado.filter(producto => {
        const estado = determinarEstadoProducto(producto);
        return estado === filtros.status;
      });
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      const [campo, direccion] = filtros.sortBy.split('_');
      let valorA, valorB;

      switch (campo) {
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'precio':
          valorA = a.precio || 0;
          valorB = b.precio || 0;
          break;
        case 'fecha':
          valorA = new Date(a.fechaCreacion);
          valorB = new Date(b.fechaCreacion);
          break;
        case 'vencimiento':
          valorA = new Date(a.vencimiento);
          valorB = new Date(b.vencimiento);
          break;
        default:
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
      }

      if (direccion === 'desc') {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      } else {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      }
    });

    return resultado;
  }, [productos, debouncedSearch, filtros.status, filtros.sortBy]);

  // Hook de paginación
  const {
    paginatedData: productosPaginados,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    getPageNumbers
  } = usePagination(productosFiltrados, filtros.itemsPerPage);

  // Cargar productos
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosData = await productoService.obtenerTodosLosProductos(currentUser.uid);
      setProductos(productosData);
      
      // Calcular estadísticas
      calcularEstadisticas(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos. Intenta nuevamente.',
        confirmButtonColor: '#28a745'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (productosData) => {
    const stats = {
      total: productosData.length,
      disponibles: 0,
      porVencer: 0,
      vencidos: 0,
      agotados: 0,
      gratuitos: 0
    };

    productosData.forEach(producto => {
      const estado = determinarEstadoProducto(producto);
      
      switch (estado) {
        case PRODUCT_STATUS.DISPONIBLE:
          stats.disponibles++;
          break;
        case PRODUCT_STATUS.POR_VENCER:
          stats.porVencer++;
          break;
        case PRODUCT_STATUS.VENCIDO:
          stats.vencidos++;
          break;
        case PRODUCT_STATUS.AGOTADO:
          stats.agotados++;
          break;
      }

      if (producto.precio === 0) {
        stats.gratuitos++;
      }
    });

    setEstadisticas(stats);
  };

  // Manejar cambios en filtros
  const handleFilterChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    
    // Si cambia el tamaño de página, actualizar paginación
    if (nuevosFiltros.itemsPerPage !== filtros.itemsPerPage) {
      changePageSize(nuevosFiltros.itemsPerPage);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFiltros({
      search: '',
      status: '',
      sortBy: 'nombre_asc',
      itemsPerPage: 10
    });
    changePageSize(10);
  };

  // Abrir modal para nuevo producto
  const handleNuevoProducto = () => {
    setProductoEditando(null);
    setModalShow(true);
  };

  // Abrir modal para editar producto
  const handleEditarProducto = (producto) => {
    setProductoEditando(producto);
    setModalShow(true);
  };

  // Ver detalles del producto
  const handleVerProducto = (producto) => {
    const estado = determinarEstadoProducto(producto);
    const isGratuito = producto.precio === 0;
    
    Swal.fire({
      title: producto.nombre,
      html: `
        <div class="text-start">
          <p><strong>Descripción:</strong><br>${producto.descripcion || 'Sin descripción'}</p>
          <p><strong>Cantidad:</strong> ${producto.cantidad}</p>
          <p><strong>Precio:</strong> ${isGratuito ? 'Gratis' : `$${producto.precio?.toLocaleString()}`}</p>
          <p><strong>Vencimiento:</strong> ${new Date(producto.vencimiento).toLocaleDateString('es-ES')}</p>
          <p><strong>Estado:</strong> <span class="badge bg-${estado === 'disponible' ? 'success' : estado === 'por_vencer' ? 'warning' : estado === 'vencido' ? 'danger' : 'secondary'}">${estado.replace('_', ' ').toUpperCase()}</span></p>
          ${producto.fechaCreacion ? `<p><strong>Creado:</strong> ${new Date(producto.fechaCreacion).toLocaleDateString('es-ES')}</p>` : ''}
        </div>
      `,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Cerrar',
      width: '500px'
    });
  };

  // Eliminar producto
  const handleEliminarProducto = async (producto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Esta acción eliminará permanentemente el producto:</p>
        <strong>"${producto.nombre}"</strong>
        <p class="text-muted mt-2">Esta acción no se puede deshacer.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await productoService.eliminarProducto(producto.id);
        
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado correctamente.',
          confirmButtonColor: '#28a745',
          timer: 2000,
          showConfirmButton: false
        });

        // Recargar productos
        cargarProductos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el producto. Intenta nuevamente.',
          confirmButtonColor: '#28a745'
        });
      }
    }
  };

  // Guardar producto (crear o actualizar)
  const handleGuardarProducto = async (datosProducto, productoId = null) => {
    try {
      setModalLoading(true);
      
      // Usar el ID del producto editando o el ID pasado como parámetro
      const esEdicion = productoEditando || productoId;
      const idProducto = productoEditando?.id || productoId;
      
      if (esEdicion && idProducto) {
        // Actualizar producto existente
        await productoService.actualizarProducto(idProducto, datosProducto);
        
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El producto ha sido actualizado correctamente.',
          confirmButtonColor: '#28a745',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Crear nuevo producto
        await productoService.crearProducto(datosProducto, currentUser.uid);
        
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'El producto ha sido creado correctamente.',
          confirmButtonColor: '#28a745',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setModalShow(false);
      setProductoEditando(null);
      
      // Recargar productos
      cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el producto. Intenta nuevamente.',
        confirmButtonColor: '#28a745'
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    if (currentUser?.uid) {
      cargarProductos();
    }
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  return (
    <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-0 text-success">
                  <i className="fas fa-box me-2"></i>
                  Gestión de Productos
                </h1>
                <p className="text-muted mb-0">
                  Administra tu catálogo de productos ecológicos
                </p>
              </div>
              <button
                className="btn btn-success"
                onClick={handleNuevoProducto}
              >
                <i className="fas fa-plus me-2"></i>
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="row mb-4">
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-box fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.total}</h4>
                <small>Total</small>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.disponibles}</h4>
                <small>Disponibles</small>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.porVencer}</h4>
                <small>Por Vencer</small>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-times-circle fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.vencidos}</h4>
                <small>Vencidos</small>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-secondary text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-ban fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.agotados}</h4>
                <small>Agotados</small>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <i className="fas fa-gift fa-2x mb-2"></i>
                <h4 className="mb-0">{estadisticas.gratuitos}</h4>
                <small>Gratuitos</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ProductosFilters
          filters={filtros}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalProducts={productos.length}
          filteredProducts={productosFiltrados.length}
        />

        {/* Lista de productos */}
        {productosPaginados.length === 0 ? (
          <EmptyState
            icon="fas fa-box"
            title={productos.length === 0 ? "No tienes productos" : "No se encontraron productos"}
            message={productos.length === 0 ? 
              "Comienza agregando tu primer producto ecológico" : 
              "Intenta ajustar los filtros de búsqueda"
            }
            actionText={productos.length === 0 ? "Agregar Producto" : "Limpiar Filtros"}
            onAction={productos.length === 0 ? handleNuevoProducto : handleClearFilters}
          />
        ) : (
          <>
            <div className="row">
              {productosPaginados.map(producto => (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  onEdit={handleEditarProducto}
                  onDelete={handleEliminarProducto}
                  onView={handleVerProducto}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="row mt-4">
                <div className="col-12">
                  <nav aria-label="Paginación de productos">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">
                          Mostrando {((currentPage - 1) * filtros.itemsPerPage) + 1} - {Math.min(currentPage * filtros.itemsPerPage, totalItems)} de {totalItems} productos
                        </small>
                      </div>
                      
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        
                        {getPageNumbers().map(pageNum => (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => goToPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de producto */}
        <ProductoModal
          isOpen={modalShow}
          onClose={() => {
            setModalShow(false);
            setProductoEditando(null);
          }}
          onSave={handleGuardarProducto}
          producto={productoEditando}
          empresaId={currentUser?.uid}
        />
      </div>
  );
};

export default ProductosEmpresa; 