import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    pais: '',
    comuna: '',
    direccion: '',
    telefono: '',
    tipoUsuario: 'cliente',
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    
    // Validaciones básicas
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.correo.trim()) nuevosErrores.correo = 'El correo es obligatorio';
    if (!formData.contraseña) nuevosErrores.contraseña = 'La contraseña es obligatoria';
    if (!formData.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      setLoading(true);
      try {
        await signup(formData);
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada correctamente.',
          confirmButtonText: 'Entendido'
        }).then(() => {
          navigate('/login');
        });
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        let errorMessage = 'Hubo un problema al crear tu cuenta. Intenta nuevamente.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este correo electrónico ya está registrado.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'El formato del correo electrónico no es válido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: errorMessage
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Registro de Cliente</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre completo *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    disabled={loading}
                  />
                  {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico *</label>
                  <input 
                    type="email" 
                    className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                    name="correo" 
                    value={formData.correo} 
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    disabled={loading}
                  />
                  {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña *</label>
                  <input 
                    type="password" 
                    className={`form-control ${errores.contraseña ? 'is-invalid' : ''}`}
                    name="contraseña" 
                    value={formData.contraseña} 
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                  />
                  {errores.contraseña && <div className="invalid-feedback">{errores.contraseña}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">País</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="pais" 
                    value={formData.pais} 
                    onChange={handleChange}
                    placeholder="País"
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Comuna/Ciudad</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="comuna" 
                    value={formData.comuna} 
                    onChange={handleChange}
                    placeholder="Comuna o ciudad"
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección completa"
                    disabled={loading}
                  />
                  {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono (opcional)</label>
                  <input 
                    type="tel" 
                    className="form-control"
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>Registrarse
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Link>
              </div>
              
              <div className="text-center mt-2">
                <Link to="/" className="text-decoration-none">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 