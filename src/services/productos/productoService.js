import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { isNearExpiration, isExpired } from '../../utils/helpers/dateUtils';
import { PRODUCT_STATUS } from '../../utils/constants/validationRules';

const COLLECTION_NAME = 'productos';

/**
 * Servicio para gestión de productos
 */
export const productoService = {
  /**
   * Crear un nuevo producto
   * @param {Object} productoData - Datos del producto
   * @param {string} empresaId - ID de la empresa
   * @returns {Promise<string>} ID del producto creado
   */
  async crearProducto(productoData, empresaId) {
    try {
      const producto = {
        ...productoData,
        empresaId,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        estado: this.determinarEstado(productoData)
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), producto);
      return docRef.id;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw new Error('Error al crear el producto: ' + error.message);
    }
  },

  /**
   * Obtener productos de una empresa
   * @param {string} empresaId - ID de la empresa
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} Productos y metadatos
   */
  async obtenerProductosEmpresa(empresaId, options = {}) {
    try {
      const {
        filtroEstado = '',
        busqueda = '',
        ordenarPor = 'nombre_asc',
        limite = 10,
        ultimoDoc = null
      } = options;

      let q = query(
        collection(db, COLLECTION_NAME),
        where('empresaId', '==', empresaId)
      );

      // Aplicar filtro de estado
      if (filtroEstado) {
        q = query(q, where('estado', '==', filtroEstado));
      }

      // Aplicar ordenamiento
      const [campo, direccion] = ordenarPor.split('_');
      const campoOrden = campo === 'nombre' ? 'nombre' : 
                        campo === 'precio' ? 'precio' : 
                        campo === 'fecha' ? 'fechaCreacion' :
                        campo === 'vencimiento' ? 'vencimiento' : 'nombre';
      
      q = query(q, orderBy(campoOrden, direccion === 'desc' ? 'desc' : 'asc'));

      // Aplicar límite
      if (limite) {
        q = query(q, limit(limite));
      }

      // Aplicar paginación
      if (ultimoDoc) {
        q = query(q, startAfter(ultimoDoc));
      }

      const snapshot = await getDocs(q);
      let productos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Aplicar filtro de búsqueda (cliente)
      if (busqueda) {
        const busquedaLower = busqueda.toLowerCase();
        productos = productos.filter(producto => 
          producto.nombre.toLowerCase().includes(busquedaLower) ||
          producto.descripcion?.toLowerCase().includes(busquedaLower)
        );
      }

      // Actualizar estados automáticamente
      productos = productos.map(producto => ({
        ...producto,
        estado: this.determinarEstado(producto)
      }));

      return {
        productos,
        ultimoDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        total: productos.length
      };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw new Error('Error al obtener productos: ' + error.message);
    }
  },

  /**
   * Obtener todos los productos de una empresa (sin paginación)
   * @param {string} empresaId - ID de la empresa
   * @returns {Promise<Array>} Lista de productos
   */
  async obtenerTodosLosProductos(empresaId) {
    try {
      // Usar solo el filtro where sin orderBy para evitar el índice compuesto
      const q = query(
        collection(db, COLLECTION_NAME),
        where('empresaId', '==', empresaId)
      );

      const snapshot = await getDocs(q);
      let productos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar en el cliente después de obtener los datos
      productos.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion || 0);
        const fechaB = new Date(b.fechaCreacion || 0);
        return fechaB - fechaA; // Orden descendente
      });

      // Actualizar estados automáticamente
      productos = productos.map(producto => ({
        ...producto,
        estado: this.determinarEstado(producto)
      }));

      return productos;
    } catch (error) {
      console.error('Error obteniendo todos los productos:', error);
      throw new Error('Error al obtener productos: ' + error.message);
    }
  },

  /**
   * Obtener un producto por ID
   * @param {string} productoId - ID del producto
   * @returns {Promise<Object|null>} Producto o null si no existe
   */
  async obtenerProductoPorId(productoId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, productoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const producto = {
          id: docSnap.id,
          ...docSnap.data()
        };

        // Actualizar estado automáticamente
        return {
          ...producto,
          estado: this.determinarEstado(producto)
        };
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw new Error('Error al obtener el producto: ' + error.message);
    }
  },

  /**
   * Actualizar un producto
   * @param {string} productoId - ID del producto
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<void>}
   */
  async actualizarProducto(productoId, datosActualizados) {
    try {
      const producto = {
        ...datosActualizados,
        fechaActualizacion: new Date().toISOString(),
        estado: this.determinarEstado(datosActualizados)
      };

      const docRef = doc(db, COLLECTION_NAME, productoId);
      await updateDoc(docRef, producto);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw new Error('Error al actualizar el producto: ' + error.message);
    }
  },

  /**
   * Eliminar un producto
   * @param {string} productoId - ID del producto
   * @returns {Promise<void>}
   */
  async eliminarProducto(productoId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, productoId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw new Error('Error al eliminar el producto: ' + error.message);
    }
  },

  /**
   * Obtener estadísticas de productos de una empresa
   * @param {string} empresaId - ID de la empresa
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(empresaId) {
    try {
      const productos = await this.obtenerTodosLosProductos(empresaId);

      const stats = {
        total: productos.length,
        disponibles: 0,
        porVencer: 0,
        vencidos: 0,
        agotados: 0,
        gratuitos: 0,
        valorTotal: 0
      };

      productos.forEach(producto => {
        const estado = this.determinarEstado(producto);
        
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

        stats.valorTotal += (producto.precio || 0) * (producto.cantidad || 0);
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas: ' + error.message);
    }
  },

  /**
   * Determinar el estado automático de un producto
   * @param {Object} producto - Datos del producto
   * @returns {string} Estado del producto
   */
  determinarEstado(producto) {
    if (!producto) return PRODUCT_STATUS.DISPONIBLE;

    // Si la cantidad es 0, está agotado
    if (producto.cantidad === 0) {
      return PRODUCT_STATUS.AGOTADO;
    }

    // Si no tiene fecha de vencimiento, está disponible
    if (!producto.vencimiento) {
      return PRODUCT_STATUS.DISPONIBLE;
    }

    // Verificar si está vencido
    if (isExpired(producto.vencimiento)) {
      return PRODUCT_STATUS.VENCIDO;
    }

    // Verificar si está por vencer (3 días)
    if (isNearExpiration(producto.vencimiento, 3)) {
      return PRODUCT_STATUS.POR_VENCER;
    }

    // Por defecto está disponible
    return PRODUCT_STATUS.DISPONIBLE;
  },

  /**
   * Buscar productos por texto
   * @param {string} empresaId - ID de la empresa
   * @param {string} textoBusqueda - Texto a buscar
   * @returns {Promise<Array>} Productos encontrados
   */
  async buscarProductos(empresaId, textoBusqueda) {
    try {
      const productos = await this.obtenerTodosLosProductos(empresaId);
      
      if (!textoBusqueda) return productos;

      const busquedaLower = textoBusqueda.toLowerCase();
      return productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busquedaLower) ||
        producto.descripcion?.toLowerCase().includes(busquedaLower)
      );
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw new Error('Error al buscar productos: ' + error.message);
    }
  },

  /**
   * Obtener productos próximos a vencer
   * @param {string} empresaId - ID de la empresa
   * @param {number} dias - Días de anticipación (default: 3)
   * @returns {Promise<Array>} Productos próximos a vencer
   */
  async obtenerProductosProximosAVencer(empresaId, dias = 3) {
    try {
      const productos = await this.obtenerTodosLosProductos(empresaId);
      
      return productos.filter(producto => 
        isNearExpiration(producto.vencimiento, dias) && 
        !isExpired(producto.vencimiento)
      );
    } catch (error) {
      console.error('Error obteniendo productos próximos a vencer:', error);
      throw new Error('Error al obtener productos próximos a vencer: ' + error.message);
    }
  },

  /**
   * Obtener productos vencidos
   * @param {string} empresaId - ID de la empresa
   * @returns {Promise<Array>} Productos vencidos
   */
  async obtenerProductosVencidos(empresaId) {
    try {
      const productos = await this.obtenerTodosLosProductos(empresaId);
      
      return productos.filter(producto => isExpired(producto.vencimiento));
    } catch (error) {
      console.error('Error obteniendo productos vencidos:', error);
      throw new Error('Error al obtener productos vencidos: ' + error.message);
    }
  }
};

export default productoService; 