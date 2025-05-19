import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { verificarCredencialesEmpresa } from './empresaService';
import { verificarCredencialesAdmin } from './adminService';

// Verificar si la autenticación está disponible
console.log('Estado de autenticación:', {
  authDisponible: !!auth,
  dbDisponible: !!db
});

// Función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    // Crear el usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.correo, 
      userData.contraseña
    );
    
    // Guardar información adicional del usuario en Firestore
    await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
      nombre: userData.nombre,
      correo: userData.correo,
      direccion: userData.direccion,
      comuna: userData.comuna,
      telefono: userData.telefono || '',
      tipoUsuario: userData.tipoUsuario || 'cliente',
      createdAt: new Date().toISOString()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

// Función para iniciar sesión (usuarios regulares, empresas o administradores)
export const loginUser = async (email, password) => {
  try {
    // Verificar primero si es un administrador
    try {
      console.log('Intentando autenticar como administrador:', email);
      const admin = await verificarCredencialesAdmin(email, password);
      console.log('Autenticación exitosa como administrador:', admin);
      return admin; // Devuelve la información del administrador si las credenciales son correctas
    } catch (adminError) {
      console.log('No es un administrador, intentando como empresa:', adminError.message);
      
      // Si no es un administrador, verificar si es una empresa
      try {
        console.log('Intentando autenticar como empresa:', email);
        const empresa = await verificarCredencialesEmpresa(email, password);
        console.log('Autenticación exitosa como empresa:', empresa);
        return empresa; // Devuelve la información de la empresa si las credenciales son correctas
      } catch (empresaError) {
        console.log('No es una empresa, intentando con Firebase Auth:', empresaError.message);
        
        // Si no es una empresa ni administrador, intentamos con Firebase Auth (usuarios regulares)
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('Autenticación exitosa como usuario:', userCredential.user.email);
          return {
            ...userCredential.user,
            tipo: 'usuario' // Identificar que es un usuario regular
          };
        } catch (authError) {
          console.error('Error en Firebase Auth:', authError.message);
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
