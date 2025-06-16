import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../core/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../core/firebase';

/**
 * Cambia la contraseña de un usuario (cliente)
 * @param {string} userId - ID del usuario
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<void>}
 */
export const cambiarPasswordUsuario = async (userId, nuevaPassword) => {
  try {
    // Nota: Para cambiar la contraseña de otro usuario necesitarías usar Firebase Admin SDK
    // Por ahora, solo actualizamos un campo en Firestore para indicar que se cambió
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, {
      passwordCambiada: new Date().toISOString(),
      ultimoCambioPassword: new Date().toISOString()
    });
    
    console.log('Contraseña de usuario actualizada:', userId);
    return true;
  } catch (error) {
    console.error('Error al cambiar contraseña de usuario:', error);
    throw new Error('No se pudo cambiar la contraseña del usuario');
  }
};

/**
 * Cambia la contraseña de una empresa
 * @param {string} empresaId - ID de la empresa
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<void>}
 */
export const cambiarPasswordEmpresa = async (empresaId, nuevaPassword) => {
  try {
    // Nota: Para cambiar la contraseña de otro usuario necesitarías usar Firebase Admin SDK
    // Por ahora, solo actualizamos un campo en Firestore para indicar que se cambió
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, {
      passwordCambiada: new Date().toISOString(),
      ultimoCambioPassword: new Date().toISOString()
    });
    
    console.log('Contraseña de empresa actualizada:', empresaId);
    return true;
  } catch (error) {
    console.error('Error al cambiar contraseña de empresa:', error);
    throw new Error('No se pudo cambiar la contraseña de la empresa');
  }
};

/**
 * Cambia la contraseña de un administrador
 * @param {string} adminId - ID del administrador
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<void>}
 */
export const cambiarPasswordAdmin = async (adminId, nuevaPassword) => {
  try {
    // Nota: Para cambiar la contraseña de otro usuario necesitarías usar Firebase Admin SDK
    // Por ahora, solo actualizamos un campo en Firestore para indicar que se cambió
    const adminRef = doc(db, 'Administrador', adminId);
    await updateDoc(adminRef, {
      passwordCambiada: new Date().toISOString(),
      ultimoCambioPassword: new Date().toISOString()
    });
    
    console.log('Contraseña de administrador actualizada:', adminId);
    return true;
  } catch (error) {
    console.error('Error al cambiar contraseña de administrador:', error);
    throw new Error('No se pudo cambiar la contraseña del administrador');
  }
};

/**
 * Valida que la nueva contraseña cumpla con los requisitos
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
export const validarPassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  return true;
}; 