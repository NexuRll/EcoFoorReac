import { db } from '../core/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  onSnapshot,
  getDoc,
  runTransaction
} from 'firebase/firestore';

// Crear una nueva solicitud de producto
export const crearSolicitudProducto = async (solicitudData) => {
  try {
    const solicitud = {
      ...solicitudData,
      estado: 'pendiente',
      fechaSolicitud: new Date().toISOString(),
      fechaRespuesta: null
    };

    const docRef = await addDoc(collection(db, 'solicitudes'), solicitud);
    return { id: docRef.id, ...solicitud };
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
};

// Obtener solicitudes de un cliente (su carrito)
export const obtenerSolicitudesCliente = async (clienteId) => {
  try {
    const q = query(
      collection(db, 'solicitudes'),
      where('clienteId', '==', clienteId)
    );
    
    const querySnapshot = await getDocs(q);
    const solicitudes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    return solicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
  } catch (error) {
    console.error('Error al obtener solicitudes del cliente:', error);
    throw error;
  }
};

// Obtener solicitudes para una empresa
export const obtenerSolicitudesEmpresa = async (empresaId) => {
  try {
    const q = query(
      collection(db, 'solicitudes'),
      where('empresaId', '==', empresaId),
      where('estado', '==', 'pendiente')
    );
    
    const querySnapshot = await getDocs(q);
    const solicitudes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    return solicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
  } catch (error) {
    console.error('Error al obtener solicitudes de la empresa:', error);
    throw error;
  }
};

// Función para actualizar el stock de un producto
const actualizarStockProducto = async (productoId, cantidadADescontar) => {
  try {
    const productoRef = doc(db, 'productos', productoId);
    const productoDoc = await getDoc(productoRef);
    
    if (!productoDoc.exists()) {
      throw new Error('Producto no encontrado');
    }
    
    const productoData = productoDoc.data();
    const stockActual = productoData.cantidad || 0;
    const nuevoStock = Math.max(0, stockActual - cantidadADescontar);
    
    await updateDoc(productoRef, {
      cantidad: nuevoStock,
      fechaActualizacion: new Date().toISOString()
    });
    
    return nuevoStock;
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw error;
  }
};

// Responder a una solicitud (aprobar/rechazar) con manejo de stock
export const responderSolicitud = async (solicitudId, nuevoEstado) => {
  try {
    // Usar una transacción para asegurar consistencia
    return await runTransaction(db, async (transaction) => {
      // Obtener la solicitud
      const solicitudRef = doc(db, 'solicitudes', solicitudId);
      const solicitudDoc = await transaction.get(solicitudRef);
      
      if (!solicitudDoc.exists()) {
        throw new Error('Solicitud no encontrada');
      }
      
      const solicitudData = solicitudDoc.data();
      
      // Si se aprueba la solicitud, descontar del stock
      if (nuevoEstado === 'aprobado') {
        const productoRef = doc(db, 'productos', solicitudData.productoId);
        const productoDoc = await transaction.get(productoRef);
        
        if (!productoDoc.exists()) {
          throw new Error('Producto no encontrado');
        }
        
        const productoData = productoDoc.data();
        const stockActual = productoData.cantidad || 0;
        const cantidadSolicitada = solicitudData.cantidad || 0;
        
        // Verificar que hay suficiente stock
        if (stockActual < cantidadSolicitada) {
          throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidadSolicitada}`);
        }
        
        const nuevoStock = stockActual - cantidadSolicitada;
        
        // Actualizar el stock del producto
        transaction.update(productoRef, {
          cantidad: nuevoStock,
          fechaActualizacion: new Date().toISOString()
        });
      }
      
      // Actualizar el estado de la solicitud
      transaction.update(solicitudRef, {
        estado: nuevoEstado,
        fechaRespuesta: new Date().toISOString()
      });
      
      return true;
    });
  } catch (error) {
    console.error('Error al responder solicitud:', error);
    throw error;
  }
};

// Suscribirse a cambios en solicitudes de cliente (tiempo real)
export const suscribirSolicitudesCliente = (clienteId, callback) => {
  const q = query(
    collection(db, 'solicitudes'),
    where('clienteId', '==', clienteId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const solicitudes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    const solicitudesOrdenadas = solicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
    callback(solicitudesOrdenadas);
  });
};

// Suscribirse a cambios en solicitudes de empresa (tiempo real)
export const suscribirSolicitudesEmpresa = (empresaId, callback) => {
  const q = query(
    collection(db, 'solicitudes'),
    where('empresaId', '==', empresaId),
    where('estado', '==', 'pendiente')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const solicitudes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordenar manualmente por fecha
    const solicitudesOrdenadas = solicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
    callback(solicitudesOrdenadas);
  }, (error) => {
    console.error('Error en suscripción de solicitudes empresa:', error);
  });
}; 