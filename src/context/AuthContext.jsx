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
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data(), tipo: userDoc.data().tipo || 'usuario' };
      } else {
        // Intentar buscar en colección de empresas si no es un usuario regular
        const empresaDocRef = doc(db, "empresas", uid);
        const empresaDoc = await getDoc(empresaDocRef);
        
        if (empresaDoc.exists()) {
          return { id: empresaDoc.id, ...empresaDoc.data(), tipo: 'empresa' };
        } else {
          // Intentar buscar en colección de administradores
          const adminDocRef = doc(db, "administradores", uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists()) {
            return { id: adminDoc.id, ...adminDoc.data(), tipo: 'admin' };
          }
        }
      }
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
        console.log("Estado de autenticación cambiado:", user);
        
        if (user) {
          setCurrentUser(user);
          
          // Obtener datos adicionales del usuario desde Firestore
          const additionalData = await fetchUserData(user.uid);
          setUserData(additionalData);
          setUserType(additionalData?.tipo || 'usuario');
        } else {
          setCurrentUser(null);
          setUserData(null);
          setUserType(null);
        }
        
        setLoading(false);
      });
      
      // Configurar el evento beforeunload para cerrar sesión cuando se cierra la página
      const handleBeforeUnload = () => {
        // Cerrar sesión cuando el usuario cierra la página
        if (auth.currentUser) {
          signOut(auth).catch(error => console.error("Error al cerrar sesión:", error));
        }
      };
      
      // Agregar el evento al window
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Limpiar la suscripción y el evento cuando el componente se desmonte
      return () => {
        unsubscribe();
        window.removeEventListener('beforeunload', handleBeforeUnload);
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
      const user = await loginUser(email, password);
      
      // Guardar el tipo de usuario (usuario, empresa o admin)
      if (user) {
        setUserType(user.tipo || 'usuario');
        
        // Si es una empresa o un administrador, actualizamos el estado manualmente
        if (user.tipo === 'empresa' || user.tipo === 'admin') {
          console.log('Actualizando estado para:', user.tipo);
          setCurrentUser(user);
          setUserData(user);
        }
      }
      
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