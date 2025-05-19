import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { resendVerificationEmail } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error } = useAuth();

  // Función para reenviar el correo de verificación
  const handleResendVerificationEmail = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail(email, password);
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.'
      });
    } catch (error) {
      console.error('Error al reenviar correo de verificación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo reenviar el correo de verificación. Por favor, intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(email, password);
      
      // Determinar el tipo de usuario para el mensaje de bienvenida
      let userTypeText = 'Usuario';
      if (user.tipo === 'empresa') {
        userTypeText = 'Empresa';
      } else if (user.tipo === 'admin') {
        userTypeText = 'Administrador';
      }
      
      console.log('Tipo de usuario detectado:', user.tipo);
      console.log('Redirigiendo a catálogo...');
      
      Swal.fire({
        icon: 'success',
        title: `¡Bienvenido ${userTypeText}!`,
        text: 'Has iniciado sesión correctamente',
        timer: 1500
      });
      // Redirigir a la página de catálogo donde se muestra el HomeAuth
      console.log('Intentando navegar a /catalogo');
      setTimeout(() => {
        navigate("/catalogo");
        console.log('Navegación completada');
      }, 100); // Pequeño retraso para asegurar que la navegación ocurra después de que se complete el mensaje
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      
      // Verificar si el error es de correo no verificado
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        // Mostrar un mensaje especial para correo no verificado con opción de reenviar
        Swal.fire({
          icon: 'warning',
          title: 'Correo no verificado',
          text: 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
          showCancelButton: true,
          confirmButtonText: 'Reenviar correo de verificación',
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Reenviar correo de verificación
            handleResendVerificationEmail();
          }
        });
        return;
      }
      
      // Mensajes de error más amigables según el código de error de Firebase
      let errorMessage = 'Verifica tus credenciales e intenta nuevamente';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico. Por favor, regístrate primero.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta. Por favor, verifica e intenta nuevamente.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido deshabilitada. Contacta al administrador.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Por favor, intenta más tarde o restablece tu contraseña.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Iniciar Sesión</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
                    </>
                  )}
                </button>
                <div className="mt-3 text-center">
                  <p>
                    ¿No tienes una cuenta? <Link to="/register" className="text-success">Regístrate aquí</Link>
                  </p>
                  <p>
                    <Link to="/recuperar-contrasena" className="text-success">¿Olvidaste tu contraseña?</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
