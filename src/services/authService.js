import { auth, db, configurarPersistencia } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { verificarCredencialesEmpresa } from './empresaService';
import { verificarCredencialesAdmin } from './adminService';

// Función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    // Crear el usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.correo, 
      userData.contraseña
    );
    
    // Enviar correo de verificación
    await sendEmailVerification(userCredential.user);
    
    // Guardar información adicional del usuario en Firestore
    await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
      nombre: userData.nombre,
      correo: userData.correo,
      pais: userData.pais,
      comuna: userData.comuna,
      direccion: userData.direccion,
      telefono: userData.telefono || '',
      tipoUsuario: userData.tipoUsuario || 'cliente',
      createdAt: new Date().toISOString(),
      emailVerified: false // Inicialmente no verificado
    });
    
    // Cerrar sesión inmediatamente para forzar la verificación de correo
    await signOut(auth);
    
    return userCredential.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

// Función para iniciar sesión (usuarios regulares, empresas o administradores)
export const loginUser = async (email, password) => {
  // Configurar persistencia antes del login (siempre localStorage)
  await configurarPersistencia();
  try {
    // Primero intentar con Firebase Auth (usuarios, empresas y administradores con Auth)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar si el correo electrónico ha sido verificado
      // EXCEPCIÓN: admin@gmail.com no necesita verificación (cuenta principal)
      const isAdminPrincipal = email.toLowerCase() === 'admin@gmail.com';
      
      if (!user.emailVerified && !isAdminPrincipal) {
        await signOut(auth); // Cerrar sesión inmediatamente
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      // Determinar el tipo de usuario buscando en las colecciones
      // Buscar en administradores
      try {
        const adminRef = doc(db, 'Administrador', user.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          return {
            id: user.uid,
            uid: user.uid,
            email: user.email,
            ...adminDoc.data(),
            tipo: 'admin'
          };
        }
      } catch (adminError) {
        console.log('No es administrador');
      }
      
      // Buscar en empresas
      try {
        const empresaRef = doc(db, 'empresas', user.uid);
        const empresaDoc = await getDoc(empresaRef);
        
        if (empresaDoc.exists()) {
          return {
            id: user.uid,
            uid: user.uid,
            email: user.email,
            ...empresaDoc.data(),
            tipo: 'empresa'
          };
        }
      } catch (empresaError) {
        console.log('No es empresa');
      }
      
      // Si no es admin ni empresa, es usuario regular
      return {
        ...user,
        tipo: 'usuario'
      };
      
    } catch (authError) {
      // Si el error es que el correo no está verificado, lanzamos un error específico
      if (authError.message === 'EMAIL_NOT_VERIFIED') {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      // Si no funciona con Firebase Auth, intentar con el sistema legacy
      // Verificar primero si es un administrador (legacy)
      try {
        const admin = await verificarCredencialesAdmin(email, password);
        return admin; // Devuelve la información del administrador si las credenciales son correctas
      } catch (adminError) {
        // Si no es un administrador, verificar si es una empresa (legacy)
        try {
          const empresa = await verificarCredencialesEmpresa(email, password);
          return empresa; // Devuelve la información de la empresa si las credenciales son correctas
        } catch (empresaError) {
          // Si todos fallan, lanzamos un error combinado
          throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }
      }
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

// Función para reenviar el correo de verificación
export const resendVerificationEmail = async (email, password) => {
  try {
    // Primero necesitamos iniciar sesión para obtener el objeto de usuario
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Enviar el correo de verificación nuevamente
    await sendEmailVerification(userCredential.user);
    
    // Cerrar sesión inmediatamente para que el usuario no pueda usar la aplicación
    await signOut(auth);
    
    return true;
  } catch (error) {
    console.error('Error al reenviar correo de verificación:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

// Función para enviar correo de recuperación de contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    throw error;
  }
};

// Variable para almacenar el usuario actual (puede ser usuario de Firebase o empresa)
let currentUser = null;

// Función para establecer el usuario actual (para empresas)
export const setCurrentUser = (user) => {
  currentUser = user;
};

// Función para observar cambios en el estado de autenticación
export const subscribeToAuthChanges = (callback) => {
  // Observar cambios en Firebase Auth
  return onAuthStateChanged(auth, (user) => {
    // Si hay un usuario en Firebase Auth, usamos ese
    if (user) {
      currentUser = {
        ...user,
        tipo: 'usuario'
      };
    } else if (!currentUser || currentUser.tipo !== 'empresa') {
      // Si no hay usuario en Firebase Auth y no es una empresa, es null
      currentUser = null;
    }
    
    // Notificar al callback con el usuario actual (Firebase o empresa)
    callback(currentUser);
  });
};
