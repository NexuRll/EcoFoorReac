import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { resetPassword } from '../services/authService';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa tu correo electrónico'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await resetPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Correo enviado',
        text: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña. Por favor, revisa tu bandeja de entrada.',
        confirmButtonText: 'Entendido'
      });
      setEmail('');
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      
      let errorMessage = 'Hubo un problema al enviar el correo. Intenta nuevamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
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
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Recuperar Contraseña</h2>
            </div>
            <div className="card-body">
              <p className="mb-4">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Instrucciones'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <p>
                  ¿Recordaste tu contraseña? <Link to="/login" className="text-success">Iniciar Sesión</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
