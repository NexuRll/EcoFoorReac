import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { useEffect } from "react";

/**
 * Componente que protege rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a la página de login
 * Funciona con cualquier tipo de usuario (normal, empresa, admin)
 */
export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    
    // Mostrar un indicador de carga mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }
    
    // Verificar si el usuario está autenticado y si su correo está verificado
    if (currentUser) {
        // Si es un usuario normal (no admin ni empresa) y su correo no está verificado
        if (currentUser.tipo === 'usuario' && !currentUser.emailVerified) {
            // Mostrar mensaje de advertencia y redirigir al login
            useEffect(() => {
                Swal.fire({
                    icon: 'warning',
                    title: 'Correo no verificado',
                    text: 'Debes verificar tu correo electrónico antes de acceder. Por favor, revisa tu bandeja de entrada.'
                });
            }, []);
            return <Navigate to="/login" />;
        }
        
        // Si está autenticado y el correo está verificado (o es admin/empresa), mostrar el contenido
        return children;
    }
    
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" />;
}

