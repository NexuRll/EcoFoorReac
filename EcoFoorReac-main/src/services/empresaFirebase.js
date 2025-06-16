import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
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
  secondaryApp = initializeApp(firebaseConfig, 'secondary');
  secondaryAuth = getAuth(secondaryApp);
} catch (error) {
  console.log('Usando auth principal para crear usuarios');
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
 * Registra una nueva empresa con autenticación en Firebase
 * @param {Object} empresaData - Datos de la empresa
 * @returns {Promise<Object>} - Datos de la empresa registrada
 */
export const registrarEmpresaConAuth = async (empresaData) => {
  try {
    const { nombre, email, password, rut, direccion, comuna, telefono } = empresaData;
    
    // Validar datos requeridos
    if (!nombre || !email || !password || !rut) {
      throw new Error('Faltan campos requeridos: nombre, email, password y rut');
    }
    
    const emailLimpio = email.trim().toLowerCase();
    const rutLimpio = rut.trim();
    
    // Verificar si el email ya está en uso
    const emailExiste = await verificarEmailExistente(emailLimpio);
    if (emailExiste) {
      throw new Error('Este email ya está registrado en el sistema. Por favor use otro email.');
    }
    
    // Verificar si el RUT ya existe
    const empresasRef = collection(db, 'empresas');
    const rutQuery = query(empresasRef, where('rut', '==', rutLimpio));
    const rutSnapshot = await getDocs(rutQuery);
    
    if (!rutSnapshot.empty) {
      throw new Error('Ya existe una empresa registrada con este RUT. Verifique que el RUT sea correcto.');
    }
    
    // Crear usuario en Firebase Auth usando la instancia secundaria
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailLimpio, password);
    const user = userCredential.user;
    
    // Enviar correo de verificación
    await sendEmailVerification(user);
    
    // Preparar datos de la empresa para Firestore
    const empresaDoc = {
      nombre: nombre.trim(),
      email: emailLimpio,
      rut: rutLimpio,
      direccion: direccion?.trim() || '',
      comuna: comuna?.trim() || '',
      telefono: telefono?.trim() || '',
      tipo: 'empresa',
      tipoUsuario: 'empresa',
      activa: true,
      emailVerified: false, // Inicialmente no verificado
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: user.uid
    };
    
    // Guardar datos en Firestore en la colección 'empresas'
    await setDoc(doc(db, 'empresas', user.uid), empresaDoc);
    
    // Cerrar sesión del usuario recién creado en la instancia secundaria
    if (secondaryAuth !== auth) {
      await secondaryAuth.signOut();
    }
    
    console.log('Empresa registrada correctamente:', {
      uid: user.uid,
      email: empresaDoc.email,
      nombre: empresaDoc.nombre,
      rut: empresaDoc.rut
    });
    
    return {
      uid: user.uid,
      ...empresaDoc,
      id: user.uid
    };
    
  } catch (error) {
    console.error('Error al registrar empresa:', error);
    
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
      throw new Error('El registro de empresas está deshabilitado');
    }
    
    throw error;
  }
};

/**
 * Actualiza los datos de una empresa existente
 * @param {string} empresaId - ID de la empresa
 * @param {Object} datosActualizados - Nuevos datos de la empresa
 * @returns {Promise<void>}
 */
export const actualizarEmpresaConAuth = async (empresaId, datosActualizados) => {
  try {
    // Si se incluye una nueva contraseña, actualizar en Auth
    if (datosActualizados.password) {
      // Nota: Para actualizar la contraseña en Firebase Auth necesitamos al usuario autenticado
      // Por ahora solo actualizamos Firestore
      console.log('Actualización de contraseña en Auth requiere implementación adicional');
    }
    
    // Preparar datos para Firestore (sin contraseña)
    const { password, ...datosFirestore } = datosActualizados;
    
    const datosParaActualizar = {
      ...datosFirestore,
      updatedAt: serverTimestamp()
    };
    
    // Actualizar en Firestore
    const empresaRef = doc(db, 'empresas', empresaId);
    await setDoc(empresaRef, datosParaActualizar, { merge: true });
    
    console.log('Empresa actualizada correctamente:', empresaId);
    
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw error;
  }
};

/**
 * Función para hacer login de empresa
 * @param {string} email - Email de la empresa
 * @param {string} password - Contraseña de la empresa
 * @returns {Promise<Object>} - Datos de la empresa autenticada
 */
export const loginEmpresa = async (email, password) => {
  try {
    // Autenticar con Firebase Auth principal
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtener datos adicionales de Firestore
    const empresaRef = doc(db, 'empresas', user.uid);
    const empresaDoc = await getDoc(empresaRef);
    
    if (!empresaDoc.exists()) {
      throw new Error('Datos de empresa no encontrados');
    }
    
    const empresaData = empresaDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      ...empresaData,
      tipo: 'empresa'
    };
    
  } catch (error) {
    console.error('Error en login de empresa:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('Empresa no encontrada');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Intente más tarde');
    }
    
    throw error;
  }
}; 