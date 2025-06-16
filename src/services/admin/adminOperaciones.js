import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { COLECCION_ADMIN, esAdminPrincipal } from './adminPrincipal';

/**
 * Obtiene todos los administradores
 * @returns {Promise<Array>} - Lista de administradores
 */
export const obtenerAdministradores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLECCION_ADMIN));
    
    return querySnapshot.docs.map(doc => {
      const adminData = doc.data();
      return {
        id: doc.id,
        ...adminData,
        esAdminPrincipal: esAdminPrincipal(doc.id)
      };
    });
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    throw error;
  }
};

/**
 * Crea un nuevo administrador
 * @param {Object} adminData - Datos del nuevo administrador
 * @returns {Promise<string>} - ID del administrador creado
 */
export const crearAdministrador = async (adminData) => {
  try {
    // Verificar si se proporcionó un ID específico
    const adminId = adminData.id || null;
    
    // Preparar los datos del administrador
    const datosAdmin = {
      Nombre: adminData.nombre,
      Correo: adminData.email,
      contraseña: adminData.password,
      Rol: adminData.rol || 'admin',
      FechaCreacion: new Date().toISOString()
    };
    
    if (adminId) {
      // Si se proporciona un ID específico, usar setDoc
      await setDoc(doc(db, COLECCION_ADMIN, adminId), datosAdmin);
      return adminId;
    } else {
      // Si no se proporciona ID, crear un documento con ID automático
      const docRef = await addDoc(collection(db, COLECCION_ADMIN), datosAdmin);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error al crear administrador:", error);
    throw error;
  }
};

/**
 * Actualiza los datos de un administrador
 * @param {string} adminId - ID del administrador a actualizar
 * @param {Object} adminData - Nuevos datos del administrador
 * @returns {Promise<boolean>} - True si la actualización fue exitosa
 */
export const actualizarAdministrador = async (adminId, adminData) => {
  try {
    // Verificar si es el administrador principal
    if (esAdminPrincipal(adminId)) {
      // Si es el admin principal, asegurarse que ciertos campos no se modifiquen
      const adminDoc = await getDoc(doc(db, COLECCION_ADMIN, adminId));
      const datosActuales = adminDoc.data();
      
      // Mantener el correo original para el admin principal
      // (esto es solo un ejemplo, puedes mantener otros campos importantes)
      adminData.Correo = datosActuales.Correo;
    }
    
    // Actualizar el documento del administrador
    await updateDoc(doc(db, COLECCION_ADMIN, adminId), adminData);
    return true;
  } catch (error) {
    console.error("Error al actualizar administrador:", error);
    throw error;
  }
};

/**
 * Elimina un administrador
 * @param {string} adminId - ID del administrador a eliminar
 * @returns {Promise<boolean>} - True si la eliminación fue exitosa
 */
export const eliminarAdministrador = async (adminId) => {
  try {
    // Verificar si es el administrador principal
    if (esAdminPrincipal(adminId)) {
      throw new Error("No se puede eliminar al administrador principal del sistema");
    }
    
    // Verificar si el administrador existe
    const adminDoc = await getDoc(doc(db, COLECCION_ADMIN, adminId));
    if (!adminDoc.exists()) {
      throw new Error("El administrador no existe");
    }
    
    // Eliminar el administrador
    await deleteDoc(doc(db, COLECCION_ADMIN, adminId));
    return true;
  } catch (error) {
    console.error("Error al eliminar administrador:", error);
    throw error;
  }
}; 