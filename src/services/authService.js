import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

// Función para iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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

// Función para observar cambios en el estado de autenticación
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
