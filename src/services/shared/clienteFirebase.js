import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
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
  secondaryApp = initializeApp(firebaseConfig, 'secondary-cliente');
  secondaryAuth = getAuth(secondaryApp);
} catch (error) {
  console.log('Usando auth principal para crear clientes');
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
 * Registra un nuevo cliente con autenticación en Firebase
 * @param {Object} clienteData - Datos del cliente
 * @returns {Promise<Object>} - Datos del cliente registrado
 */
export const registrarClienteConAuth = async (clienteData) => {
  try {
    const { nombre, correo, password, pais, comuna, direccion, telefono } = clienteData;
    
    // Validar datos requeridos
    if (!nombre || !correo || !password) {
      throw new Error('Faltan campos requeridos: nombre, correo y password');
    }
    
    const emailLimpio = correo.trim().toLowerCase();
    
    // Verificar si el email ya está en uso
    const emailExiste = await verificarEmailExistente(emailLimpio);
    if (emailExiste) {
      throw new Error('Este email ya está registrado en el sistema. Por favor use otro email.');
    }
    
    // Crear usuario en Firebase Auth usando la instancia secundaria
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailLimpio, password);
    const user = userCredential.user;
    
    // Enviar correo de verificación
    await sendEmailVerification(user);
    
    // Preparar datos del cliente para Firestore
    const clienteDoc = {
      nombre: nombre.trim(),
      correo: emailLimpio,
      pais: pais?.trim() || '',
      comuna: comuna?.trim() || '',
      direccion: direccion?.trim() || '',
      telefono: telefono?.trim() || '',
      tipo: 'cliente',
      tipoUsuario: 'cliente',
      activo: true,
      emailVerified: false, // Inicialmente no verificado
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: user.uid
    };
    
    // Guardar datos en Firestore en la colección 'usuarios'
    await setDoc(doc(db, 'usuarios', user.uid), clienteDoc);
    
    // Cerrar sesión del usuario recién creado en la instancia secundaria
    if (secondaryAuth !== auth) {
      await secondaryAuth.signOut();
    }
    
    console.log('Cliente registrado correctamente:', {
      uid: user.uid,
      email: clienteDoc.correo,
      nombre: clienteDoc.nombre
    });
    
    return {
      uid: user.uid,
      ...clienteDoc,
      id: user.uid
    };
    
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    
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
      throw new Error('El registro de clientes está deshabilitado');
    }
    
    throw error;
  }
}; 