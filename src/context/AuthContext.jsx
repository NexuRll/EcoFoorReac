import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/core/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { subscribeToAuthChanges, loginUser, logoutUser, registerUser } from "../services/auth/authService";

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
        return { 
          id: userDoc.id, 
          uid: uid, // Asegurar que uid esté presente
          ...userDoc.data(), 
          tipo: userDoc.data().tipo || 'usuario' 
        };
      } else {
        // Intentar buscar en colección de empresas si no es un usuario regular
        const empresaDocRef = doc(db, "empresas", uid);
        const empresaDoc = await getDoc(empresaDocRef);
        
        if (empresaDoc.exists()) {
          return { 
            id: empresaDoc.id, 
            uid: uid, // Asegurar que uid esté presente
            ...empresaDoc.data(), 
            tipo: 'empresa' 
          };
        } else {
          // Intentar buscar en colección de administradores
          const adminDocRef = doc(db, "Administrador", uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists()) {
            return { 
              id: adminDoc.id, 
              uid: uid, // Asegurar que uid esté presente
              ...adminDoc.data(), 
              tipo: 'admin' 
            };
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
      const user = await loginUser(email, password);
      // No necesitamos actualizar el estado aquí porque el useEffect con subscribeToAuthChanges lo hará
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
      await logoutUser();
      // No necesitamos limpiar manualmente el estado porque el useEffect lo hará
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Función para actualizar los datos del usuario en el contexto
  const updateUserData = async (newData) => {
    try {
      if (newData) {
        // Si se pasan nuevos datos, actualizarlos directamente
        setUserData(prevData => ({
          ...prevData,
          ...newData
        }));
      } else {
        // Si no se pasan datos, refrescar desde la base de datos
        if (currentUser) {
          const freshData = await fetchUserData(currentUser.uid);
          if (freshData) {
            setUserData(freshData);
            setUserType(freshData.tipo || 'usuario');
          }
        }
      }
      return true; // Indicar éxito
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
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
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};