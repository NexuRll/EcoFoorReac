import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    direccion: '',
    comuna: '',
    telefono: '',
    tipoUsuario: 'cliente',
  });

  const [errores, setErrores] = useState({});

  const validarContraseña = (contraseña) => {
    const tieneLongitud = contraseña.length >= 6;
    const tieneLetras = /[a-zA-Z]/.test(contraseña);
    const tieneNumeros = /\d/.test(contraseña);
    return tieneLongitud && tieneLetras && tieneNumeros;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    if (!formData.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.correo) nuevosErrores.correo = 'El correo es obligatorio';
    if (!formData.contraseña) {
      nuevosErrores.contraseña = 'La contraseña es obligatoria';
    } else if (!validarContraseña(formData.contraseña)) {
      nuevosErrores.contraseña = 'Debe tener al menos 6 caracteres, letras y numeros';
    }
    if (!formData.direccion) nuevosErrores.direccion = 'La dirección es obligatoria';
    if (!formData.comuna) nuevosErrores.comuna = 'La comuna es obligatoria';

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      setLoading(true);
      try {
        await signup(formData);
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada correctamente',
          timer: 1500
        });
        navigate('/login');
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // Mensajes de error más amigables según el código de error de Firebase
        let errorMessage = 'Hubo un problema al crear tu cuenta. Intenta nuevamente.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'El formato del correo electrónico no es válido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
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
                  <label className="form-label">Nombre completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                  />
                  {errores.nombre && <p className="text-danger">{errores.nombre}</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="correo" 
                    value={formData.correo} 
                    onChange={handleChange} 
                  />
                  {errores.correo && <p className="text-danger">{errores.correo}</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="contraseña" 
                    value={formData.contraseña} 
                    onChange={handleChange} 
                  />
                  {errores.contraseña && <p className="text-danger">{errores.contraseña}</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange} 
                  />
                  {errores.direccion && <p className="text-danger">{errores.direccion}</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Comuna</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="comuna" 
                    value={formData.comuna} 
                    onChange={handleChange} 
                  />
                  {errores.comuna && <p className="text-danger">{errores.comuna}</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono (opcional)</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de usuario</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="tipoUsuario" 
                    value="cliente" 
                    disabled 
                  />
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>Registrarse
                    </>
                  )}
                </button>
                <p className="mt-3">
                  ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
