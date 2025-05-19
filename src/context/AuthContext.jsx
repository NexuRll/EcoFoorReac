import { createContext, useContext, useState, useEffect } from "react";
import { subscribeToAuthChanges, loginUser, logoutUser, registerUser, setCurrentUser } from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'usuario' o 'empresa'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Suscribirse a los cambios en el estado de autenticación
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      // Resetear el tipo de usuario si se cierra sesión
      if (!user) {
        setUserType(null);
      }
      setLoading(false);
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
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
      
      // Guardar el tipo de usuario (usuario o empresa)
      if (user) {
        setUserType(user.tipo || 'usuario');
        
        // Si es una empresa o un administrador, actualizamos el estado manualmente ya que Firebase Auth no lo maneja
        if (user.tipo === 'empresa' || user.tipo === 'admin') {
          console.log('Actualizando estado para:', user.tipo);
          setCurrentUser(user);
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
    loading,
    error,
    userType,
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