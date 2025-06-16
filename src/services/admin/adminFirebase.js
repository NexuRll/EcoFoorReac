import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../core/firebase";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración de Firebase (usa la misma configuración)
const firebaseConfig = {
  // La configuración se tomará de la instancia principal
  apiKey: auth.app.options.apiKey,
  authDomain: auth.app.options.authDomain,
  projectId: auth.app.options.projectId,
  storageBucket: auth.app.options.storageBucket,
  messagingSenderId: auth.app.options.messagingSenderId,
  appId: auth.app.options.appId
};

// Crear segunda instancia de Firebase para crear usuarios sin afectar la sesión actual
let secondaryApp = null;
let secondaryAuth = null;

try {
  secondaryApp = initializeApp(firebaseConfig, 'secondary-admin');
  secondaryAuth = getAuth(secondaryApp);
} catch (error) {
  console.log('Usando auth principal para crear administradores');
  secondaryAuth = auth;
}

/**
 * Verifica si un email ya está registrado en el sistema
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} - True si el email ya existe
 */
const verificarEmailExistente = async (email) => {
  try {
    // Verificar en la colección de usuarios (clientes)
    const usuariosRef = collection(db, 'usuarios');
    const emailQuery = query(usuariosRef, where('correo', '==', email.toLowerCase()));
    const usuariosSnapshot = await getDocs(emailQuery);
    
    if (!usuariosSnapshot.empty) {
      return true;
    }
    
    // Verificar en la colección de empresas
    const empresasRef = collection(db, 'empresas');
    const empresasQuery = query(empresasRef, where('email', '==', email.toLowerCase()));
    const empresasSnapshot = await getDocs(empresasQuery);
    
    if (!empresasSnapshot.empty) {
      return true;
    }
    
    // Verificar en la colección de administradores
    const adminRef = collection(db, 'Administrador');
    const adminQuery = query(adminRef, where('Correo', '==', email.toLowerCase()));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando email:', error);
    return false; // En caso de error, permitir continuar
  }
};

/**
 * Registra un nuevo administrador con autenticación en Firebase
 * @param {Object} adminData - Datos del administrador
 * @returns {Promise<Object>} - Datos del administrador registrado
 */
export const registrarAdministradorConAuth = async (adminData) => {
  try {
    const { nombre, email, password, rol = 'admin' } = adminData;
    
    // Validar datos requeridos
    if (!nombre || !email || !password) {
      throw new Error('Faltan campos requeridos: nombre, email y password');
    }
    
    const emailLimpio = email.trim().toLowerCase();
    
    // Verificar si el email ya está en uso
    const emailExiste = await verificarEmailExistente(emailLimpio);
    if (emailExiste) {
      throw new Error('Este email ya está registrado en el sistema. Por favor use otro email.');
    }
    
    // Crear usuario en Firebase Auth usando la instancia secundaria
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailLimpio, password);
    const user = userCredential.user;
    
    // Enviar correo de verificación SOLO si NO es el admin principal
    const isAdminPrincipal = emailLimpio === 'admin@gmail.com';
    
    if (!isAdminPrincipal) {
      await sendEmailVerification(user);
    }
    
    // Preparar datos del administrador para Firestore
    const adminDoc = {
      Nombre: nombre.trim(),
      Correo: emailLimpio,
      Rol: rol,
      tipo: 'admin',
      tipoUsuario: 'admin',
      activo: true,
      emailVerified: isAdminPrincipal ? true : false, // Admin principal se considera verificado
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: user.uid,
      esAdminPrincipal: false // Los administradores creados aquí no son principales
    };
    
    // Guardar datos en Firestore en la colección 'Administrador'
    await setDoc(doc(db, 'Administrador', user.uid), adminDoc);
    
    // Cerrar sesión del usuario recién creado en la instancia secundaria
    if (secondaryAuth !== auth) {
      await secondaryAuth.signOut();
    }
    
    console.log('Administrador registrado correctamente:', {
      uid: user.uid,
      email: adminDoc.Correo,
      nombre: adminDoc.Nombre,
      rol: adminDoc.Rol,
      verificacionRequerida: !isAdminPrincipal
    });
    
    return {
      uid: user.uid,
      ...adminDoc,
      id: user.uid
    };
    
  } catch (error) {
    console.error('Error al registrar administrador:', error);
    
    // Cerrar sesión en caso de error también
    if (secondaryAuth !== auth) {
      try {
        await secondaryAuth.signOut();
      } catch (signOutError) {
        console.log('Error al cerrar sesión secundaria:', signOutError);
      }
    }
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email ya está registrado en Firebase Auth. Use otro email.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El formato del email es inválido');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('El registro de administradores está deshabilitado');
    }
    
    throw error;
  }
};

/**
 * Actualiza los datos de un administrador existente
 * @param {string} adminId - ID del administrador
 * @param {Object} datosActualizados - Nuevos datos del administrador
 * @returns {Promise<void>}
 */
export const actualizarAdministradorConAuth = async (adminId, datosActualizados) => {
  try {
    // Si se incluye una nueva contraseña, actualizar en Auth
    if (datosActualizados.password || datosActualizados.contraseña) {
      // Nota: Para actualizar la contraseña en Firebase Auth necesitamos al usuario autenticado
      // Por ahora solo actualizamos Firestore
      console.log('Actualización de contraseña en Auth requiere implementación adicional');
    }
    
    // Preparar datos para Firestore (sin contraseña)
    const { password, contraseña, ...datosFirestore } = datosActualizados;
    
    const datosParaActualizar = {
      ...datosFirestore,
      updatedAt: serverTimestamp()
    };
    
    // Actualizar en Firestore
    const adminRef = doc(db, 'Administrador', adminId);
    await setDoc(adminRef, datosParaActualizar, { merge: true });
    
    console.log('Administrador actualizado correctamente:', adminId);
    
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    throw error;
  }
};

/**
 * Inicia sesión de un administrador
 * @param {string} email - Email del administrador
 * @param {string} password - Contraseña del administrador
 * @returns {Promise<Object>} - Datos del administrador autenticado
 */
export const loginAdministrador = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verificar si es administrador en Firestore
    const adminDoc = await getDoc(doc(db, 'Administrador', user.uid));
    
    if (!adminDoc.exists()) {
      await auth.signOut(); // Cerrar sesión si no es administrador
      throw new Error('Usuario no autorizado como administrador');
    }
    
    const adminData = adminDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      ...adminData,
      tipo: 'admin'
    };
    
  } catch (error) {
    console.error('Error en login de administrador:', error);
    throw error;
  }
};

/**
 * Obtiene todos los administradores registrados
 * @returns {Promise<Array>} - Lista de administradores
 */
export const obtenerTodosLosAdministradores = async () => {
  try {
    const adminCollection = collection(db, 'Administrador');
    const adminSnapshot = await getDocs(adminCollection);
    
    const administradores = [];
    adminSnapshot.forEach((doc) => {
      administradores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return administradores;
  } catch (error) {
    console.error('Error obteniendo administradores:', error);
    throw error;
  }
};

/**
 * Elimina un administrador del sistema
 * @param {string} adminId - ID del administrador a eliminar
 * @returns {Promise<void>}
 */
export const eliminarAdministradorConAuth = async (adminId) => {
  try {
    // Eliminar de Firestore
    await deleteDoc(doc(db, 'Administrador', adminId));
    
    // Nota: Para eliminar de Firebase Auth necesitaríamos permisos especiales
    // Por ahora solo eliminamos de Firestore
    console.log('Administrador eliminado de Firestore:', adminId);
    
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    throw error;
  }
}; 