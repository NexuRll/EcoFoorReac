import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { resendVerificationEmail } from "../services/authService";

export default function Login() {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.correo, formData.contraseña);
      
      console.log('Usuario logueado:', user);
      console.log('Tipo de usuario:', user?.tipo);
      
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirigir según el tipo de usuario
      if (user?.tipo === 'admin') {
        console.log('Redirigiendo a admin dashboard...');
        navigate('/admin/dashboard');
      } else if (user?.tipo === 'empresa') {
        console.log('Redirigiendo a perfil de empresa...');
        navigate('/perfil'); // Redirigir a perfil común, se diferenciará por tipo
      } else {
        console.log('Redirigiendo a perfil de cliente...');
        navigate('/perfil'); // Redirigir a perfil común, se diferenciará por tipo
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        Swal.fire({
          icon: 'warning',
          title: 'Correo no verificado',
          text: 'Por favor verifica tu correo electrónico antes de iniciar sesión.',
          showCancelButton: true,
          confirmButtonText: 'Reenviar correo',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Implementar reenvío de correo de verificación
              Swal.fire({
                icon: 'info',
                title: 'Correo reenviado',
                text: 'Revisa tu bandeja de entrada'
              });
            } catch (resendError) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo reenviar el correo'
              });
            }
          }
        });
        return;
      }
      
      if (error.message.includes('invalid-credential') || error.message.includes('user-not-found')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      } else {
        errorMessage = error.message || 'Error desconocido';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para prueba rápida de admin
  const testAdminLogin = async () => {
    setLoading(true);
    try {
      // Usar credenciales de prueba (puedes cambiar estos valores)
      const testCredentials = {
        correo: 'admin@ecofood.com',
        contraseña: 'admin123'
      };
      
      const user = await login(testCredentials.correo, testCredentials.contraseña);
      console.log('Test admin login result:', user);
      
      if (user?.tipo === 'admin') {
        navigate('/admin/dashboard');
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Usuario de prueba',
          text: `Tipo de usuario: ${user?.tipo || 'desconocido'}`
        });
      }
    } catch (error) {
      console.error('Error en test admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de prueba',
        text: `No se pudo hacer login de prueba: ${error.message}`
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
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.correo}
                    onChange={handleChange}
                    name="correo"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.contraseña}
                    onChange={handleChange}
                    name="contraseña"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <small>Las sesiones se mantienen automáticamente guardadas en el navegador</small>
                  </div>
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
                <button 
                  type="button" 
                  className="btn btn-warning w-100 mb-3"
                  onClick={testAdminLogin}
                  disabled={loading}
                >
                  <i className="fas fa-cog me-2"></i>
                  Probar Login Admin
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
