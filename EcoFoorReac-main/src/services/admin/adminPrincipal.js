import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ID del administrador principal que no se puede eliminar
export const ADMIN_PRINCIPAL_UID = "fAfWKq9gSMX1SFTAr3zeb0RYY903";

// Nombre de la colección de administradores en Firestore
export const COLECCION_ADMIN = "Administrador";

/**
 * Verifica si un ID dado corresponde al administrador principal
 * @param {string} uid - ID del usuario a verificar
 * @returns {boolean} - True si es el administrador principal
 */
export const esAdminPrincipal = (uid) => {
  return uid === ADMIN_PRINCIPAL_UID;
};

/**
 * Obtiene la información del administrador principal desde Firestore
 * @returns {Promise<Object|null>} - Datos del administrador principal o null si no existe
 */
export const obtenerAdminPrincipal = async () => {
  try {
    const adminDocRef = doc(db, COLECCION_ADMIN, ADMIN_PRINCIPAL_UID);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      return {
        id: adminDoc.id,
        ...adminDoc.data(),
        esAdminPrincipal: true
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener administrador principal:", error);
    throw error;
  }
};

/**
 * Verifica si el administrador principal ya está configurado en Firestore
 * @returns {Promise<boolean>} - True si el admin principal existe
 */
export const existeAdminPrincipal = async () => {
  try {
    const adminPrincipal = await obtenerAdminPrincipal();
    return adminPrincipal !== null;
  } catch (error) {
    console.error("Error al verificar existencia del administrador principal:", error);
    return false;
  }
}; 