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
  runTransaction,
  deleteDoc
} from 'firebase/firestore';

// Función para limpiar solicitudes pendientes antiguas (más de 24 horas)
export const limpiarSolicitudesPendientesAntiguas = async (clienteId) => {
  try {
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    
    const q = query(
      collection(db, 'solicitudes'),
      where('clienteId', '==', clienteId),
      where('estado', '==', 'pendiente')
    );
    
    const querySnapshot = await getDocs(q);
    const solicitudesAEliminar = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const solicitud = docSnapshot.data();
      const fechaSolicitud = new Date(solicitud.fechaSolicitud);
      
      // Si la solicitud tiene más de 24 horas, marcarla para eliminación
      if (fechaSolicitud < hace24Horas) {
        solicitudesAEliminar.push({
          id: docSnapshot.id,
          ...solicitud
        });
      }
    });
    
    // Eliminar solicitudes pendientes antiguas
    const promesasEliminacion = solicitudesAEliminar.map(solicitud => 
      deleteDoc(doc(db, 'solicitudes', solicitud.id))
    );
    
    await Promise.all(promesasEliminacion);
    
    console.log(`🗑️ Eliminadas ${solicitudesAEliminar.length} solicitudes pendientes antiguas`);
    return solicitudesAEliminar.length;
  } catch (error) {
    console.error('Error al limpiar solicitudes pendientes antiguas:', error);
    throw error;
  }
};

// Función para verificar y limpiar solicitudes al cargar el carrito
export const verificarYLimpiarSolicitudesAntiguas = async (clienteId) => {
  try {
    const eliminadas = await limpiarSolicitudesPendientesAntiguas(clienteId);
    if (eliminadas > 0) {
      console.log(`🧹 Limpieza automática: ${eliminadas} solicitudes pendientes eliminadas`);
    }
    return eliminadas;
  } catch (error) {
    console.error('Error en verificación de limpieza:', error);
    return 0;
  }
};

// Función para cancelar una solicitud pendiente
export const cancelarSolicitudPendiente = async (solicitudId) => {
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
      
      // Verificar que la solicitud esté pendiente
      if (solicitudData.estado !== 'pendiente') {
        throw new Error('Solo se pueden cancelar solicitudes pendientes');
      }
      
      // Restaurar el stock del producto
      const productoRef = doc(db, 'productos', solicitudData.productoId);
      const productoDoc = await transaction.get(productoRef);
      
      if (productoDoc.exists()) {
        const productoData = productoDoc.data();
        const stockActual = productoData.cantidad || 0;
        const cantidadACancelar = solicitudData.cantidad || 0;
        const nuevoStock = stockActual + cantidadACancelar;
        
        // Actualizar el stock del producto
        transaction.update(productoRef, {
          cantidad: nuevoStock,
          fechaActualizacion: new Date().toISOString()
        });
        
        console.log(`📦 Stock restaurado: ${cantidadACancelar} unidades devueltas a ${solicitudData.nombreProducto}`);
      }
      
      // Eliminar la solicitud completamente
      transaction.delete(solicitudRef);
      
      console.log(`❌ Solicitud cancelada y eliminada: ${solicitudData.nombreProducto}`);
      
      return {
        nombreProducto: solicitudData.nombreProducto,
        cantidad: solicitudData.cantidad,
        stockRestaurado: true
      };
    });
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    throw error;
  }
};

// Función para verificar si una solicitud se puede cancelar
export const puedeCancelarSolicitud = (solicitud) => {
  return solicitud.estado === 'pendiente';
};

// Función para obtener el tiempo transcurrido desde la solicitud
export const obtenerTiempoTranscurrido = (fechaSolicitud) => {
  const ahora = new Date();
  const fecha = new Date(fechaSolicitud);
  const diferencia = ahora - fecha;
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias > 0) {
    return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  } else if (horas > 0) {
    return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  } else {
    return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  }
};
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