import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Obtiene todos los usuarios clientes
 * @returns {Promise<Array>} - Lista de usuarios
 */
export const obtenerUsuarios = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} - Datos del usuario o null si no existe
 */
export const obtenerUsuarioPorId = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "usuarios", userId));
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} userData - Nuevos datos del usuario
 * @returns {Promise<boolean>} - True si la actualización fue exitosa
 */
export const actualizarUsuario = async (userId, userData) => {
  try {
    await updateDoc(doc(db, "usuarios", userId), userData);
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {string} userId - ID del usuario a eliminar
 * @returns {Promise<boolean>} - True si la eliminación fue exitosa
 */
export const eliminarUsuario = async (userId) => {
  try {
    await deleteDoc(doc(db, "usuarios", userId));
    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
}; 