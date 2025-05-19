import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        try {
            // Usamos try para tratar de conectar a firebase
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                console.log("Estado de autenticación cambiado:", currentUser);
                setUser(currentUser);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error al conectar con Firebase:", error);
            setLoading(false);
        }
    }, []);
    
    // No bloqueamos el renderizado con la pantalla de carga
    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};