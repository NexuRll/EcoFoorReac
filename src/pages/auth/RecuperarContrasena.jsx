import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/core/firebase';

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa tu correo electrónico'
      });
      return;
    }

    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        html: `
          <p>Se ha enviado un correo de recuperación a:</p>
          <p><strong>${email}</strong></p>
          <p>Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
          <p><small>Si no ves el correo, revisa tu carpeta de spam.</small></p>
        `,
        confirmButtonText: 'Entendido'
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      
      let errorMessage = 'Hubo un problema al enviar el correo de recuperación.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta nuevamente más tarde.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
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
            <div className="card-header bg-warning text-dark">
              <h2 className="mb-0">
                <i className="fas fa-key me-2"></i>
                Recuperar Contraseña
              </h2>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-warning w-100" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Enviar Correo de Recuperación
                    </>
                  )}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver al inicio de sesión
                </Link>
              </div>
              
              <div className="text-center mt-2">
                <Link to="/register" className="text-decoration-none">
                  ¿No tienes cuenta? Regístrate aquí
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena; 