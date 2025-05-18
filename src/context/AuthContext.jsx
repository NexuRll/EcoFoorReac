import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { subscribeToAuthChanges, loginUser, logoutUser, registerUser } from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Suscribirse a los cambios en el estado de autenticación
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
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

  // Función para iniciar sesión
  const login = async (email, password) => {
    setError(null);
    try {
      const user = await loginUser(email, password);
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
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
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