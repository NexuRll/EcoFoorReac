// Servicio actualizado: registrarClienteConAuth

import { db, auth } from "./firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  setDoc, 
  doc
} from "firebase/firestore";

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
  secondaryApp = initializeApp(firebaseConfig, 'secondary-client');
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

export const registrarClienteConAuth = async (datos) => {
  try {
    const emailLimpio = datos.email.trim().toLowerCase();
    
    // Verificar si el email ya está en uso
    const emailExiste = await verificarEmailExistente(emailLimpio);
    if (emailExiste) {
      throw new Error('Este email ya está registrado en el sistema. Por favor use otro email.');
    }
    
    const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLimpio, datos.password);
    await sendEmailVerification(cred.user);
    
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: datos.nombre || "",
      comuna: datos.comuna || "",
      direccion: datos.direccion || "",
      tipoUsuario: "cliente",
      correo: emailLimpio,
      telefono: datos.telefono || "",
      createdAt: new Date().toISOString(),
      emailVerified: false,
      uid: cred.user.uid
    });
    
    // Cerrar sesión del usuario recién creado en la instancia secundaria
    if (secondaryAuth !== auth) {
      await secondaryAuth.signOut();
    }
    
    return cred;
  } catch (error) {
    console.error("Error registrando cliente:", error);
    
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
      throw new Error('El formato del email es inválido.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('El registro de usuarios está deshabilitado.');
    }
    
    throw error;
  }
};
