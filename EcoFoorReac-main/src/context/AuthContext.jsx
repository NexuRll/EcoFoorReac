import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { subscribeToAuthChanges, loginUser, logoutUser, registerUser } from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null); // 'usuario', 'empresa' o 'admin'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Función para obtener datos adicionales del usuario desde Firestore
  const fetchUserData = async (uid) => {
    try {
      console.log('fetchUserData - Buscando datos para UID:', uid);
      
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('Usuario encontrado en colección usuarios');
        return { id: userDoc.id, ...userDoc.data(), tipo: userDoc.data().tipo || 'usuario' };
      } else {
        console.log('Usuario no encontrado en usuarios, buscando en empresas...');
        // Intentar buscar en colección de empresas si no es un usuario regular
        const empresaDocRef = doc(db, "empresas", uid);
        const empresaDoc = await getDoc(empresaDocRef);
        
        if (empresaDoc.exists()) {
          console.log('Usuario encontrado en colección empresas');
          return { id: empresaDoc.id, ...empresaDoc.data(), tipo: 'empresa' };
        } else {
          console.log('Usuario no encontrado en empresas, buscando en administradores...');
          // Intentar buscar en colección de administradores (corregido el nombre)
          const adminDocRef = doc(db, "Administrador", uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists()) {
            console.log('Usuario encontrado en colección Administrador');
            return { id: adminDoc.id, ...adminDoc.data(), tipo: 'admin' };
          }
        }
      }
      console.log('Usuario no encontrado en ninguna colección');
      return null;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      // Suscribirse a los cambios en el estado de autenticación
      const unsubscribe = subscribeToAuthChanges(async (user) => {
        console.log("=== AuthContext - Estado de autenticación cambiado ===");
        console.log("user:", user);
        
        if (user) {
          setCurrentUser(user);
          
          // Obtener datos adicionales del usuario desde Firestore
          const additionalData = await fetchUserData(user.uid);
          console.log("additionalData obtenida:", additionalData);
          setUserData(additionalData);
          setUserType(additionalData?.tipo || 'usuario');
          console.log("userType establecido:", additionalData?.tipo || 'usuario');
        } else {
          setCurrentUser(null);
          setUserData(null);
          setUserType(null);
        }
        
        setLoading(false);
        console.log("=== Fin AuthContext - Estado actualizado ===");
      });
      
      // Limpiar la suscripción cuando el componente se desmonte
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error al conectar con Firebase:", error);
      setLoading(false);
    }
  }, []);

  // Función para registrar un nuevo usuario
  const signup = async (userData) => {
    setError(null);
    try {
      const user = await registerUser(userData);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Función para iniciar sesión (usuarios o empresas)
  const login = async (email, password) => {
    setError(null);
    try {
      console.log('=== AuthContext - Login iniciado ===');
      const user = await loginUser(email, password);
      console.log('Usuario retornado por loginUser:', user);
      
      // Guardar el tipo de usuario (usuario/cliente, empresa o admin)
      if (user) {
        // Normalizar el tipo de usuario
        let tipoUsuario = user.tipo || 'cliente';
        if (tipoUsuario === 'usuario') {
          tipoUsuario = 'cliente'; // Normalizar 'usuario' a 'cliente'
        }
        
        console.log('Estableciendo userType:', tipoUsuario);
        setUserType(tipoUsuario);
        
        // Si es una empresa o un administrador, actualizamos el estado manualmente
        if (tipoUsuario === 'empresa' || tipoUsuario === 'admin') {
          console.log('Actualizando estado manualmente para:', tipoUsuario);
          setCurrentUser(user);
          setUserData(user);
        }
      }
      
      console.log('=== Fin AuthContext - Login completado ===');
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setError(null);
    try {
      // Si es una empresa o un administrador, limpiamos el estado manualmente
      if (userType === 'empresa' || userType === 'admin') {
        console.log('Limpiando estado para:', userType);
        setCurrentUser(null);
        setUserData(null);
      }
      
      await logoutUser();
      setUserType(null); // Limpiar el tipo de usuario al cerrar sesión
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    userType,
    loading,
    error,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};