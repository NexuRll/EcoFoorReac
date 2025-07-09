import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { 
  validarNombre, 
  validarEmail, 
  validarPassword, 
  validarTelefono, 
  validarDireccion,
  formatearInput,
  LIMITES 
} from '../../utils/validaciones';

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
    let valorFormateado = value;
    
    // Aplicar formato segun el tipo de campo (menos agresivo)
    switch (name) {
      case 'nombre':
        // Solo eliminar numeros y caracteres especiales, mantener espacios y letras
        valorFormateado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.NOMBRE.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.NOMBRE.max);
        }
        break;
      case 'correo':
        // Solo convertir a minusculas, no hacer trim mientras escribe
        valorFormateado = value.toLowerCase();
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.EMAIL.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.EMAIL.max);
        }
        break;
      case 'contraseña':
        // Solo limitar caracteres para contraseña
        if (value.length > LIMITES.PASSWORD.max) {
          valorFormateado = value.substring(0, LIMITES.PASSWORD.max);
        }
        break;
      case 'telefono':
        // Solo permitir numeros, +, -, espacios y parentesis
        valorFormateado = value.replace(/[^0-9+\-\s()]/g, '');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.TELEFONO.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.TELEFONO.max);
        }
        break;
      case 'direccion':
        // Solo limitar caracteres
        if (value.length > LIMITES.DIRECCION.max) {
          valorFormateado = value.substring(0, LIMITES.DIRECCION.max);
        }
        break;
      case 'pais':
      case 'comuna':
        // Solo eliminar numeros y caracteres especiales
        valorFormateado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        // Limitar caracteres
        if (valorFormateado.length > LIMITES.COMUNA.max) {
          valorFormateado = valorFormateado.substring(0, LIMITES.COMUNA.max);
        }
        break;
      default:
        valorFormateado = value;
    }
    
    setFormData({
      ...formData,
      [name]: valorFormateado,
    });

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validar nombre
    const errorNombre = validarNombre(formData.nombre, 'Nombre');
    if (errorNombre) nuevosErrores.nombre = errorNombre;
    
    // Validar email
    const errorEmail = validarEmail(formData.correo);
    if (errorEmail) nuevosErrores.correo = errorEmail;
    
    // Validar contraseña
    const errorPassword = validarPassword(formData.contraseña);
    if (errorPassword) nuevosErrores.contraseña = errorPassword;
    
    // Validar pais (requerido)
    if (!formData.pais.trim()) {
      nuevosErrores.pais = 'El pais es obligatorio';
    }
    
    // Validar comuna (requerido)
    if (!formData.comuna.trim()) {
      nuevosErrores.comuna = 'La comuna es obligatoria';
    }
    
    // Validar direccion
    const errorDireccion = validarDireccion(formData.direccion);
    if (errorDireccion) nuevosErrores.direccion = errorDireccion;
    
    // Validar telefono (opcional pero con formato correcto si se proporciona)
    if (formData.telefono.trim()) {
      const errorTelefono = validarTelefono(formData.telefono);
      if (errorTelefono) nuevosErrores.telefono = errorTelefono;
    }
    
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario();
    
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
          errorMessage = 'Este correo electronico ya esta registrado.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'El formato del correo electronico no es valido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado debil. Debe tener al menos 6 caracteres.';
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
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Nombre completo *
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange}
                      maxLength={LIMITES.NOMBRE.max}
                      placeholder="Ingresa tu nombre completo"
                      disabled={loading}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    <small className="text-muted">
                      {formData.nombre.length}/{LIMITES.NOMBRE.max} caracteres - Solo letras y espacios
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Correo electronico *
                    </label>
                    <input 
                      type="email" 
                      className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                      name="correo" 
                      value={formData.correo} 
                      onChange={handleChange}
                      maxLength={LIMITES.EMAIL.max}
                      placeholder="ejemplo@correo.com"
                      disabled={loading}
                      autoComplete="new-email"
                    />
                    {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                    <small className="text-muted">
                      {formData.correo.length}/{LIMITES.EMAIL.max} caracteres
                    </small>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Contraseña *
                    </label>
                    <input 
                      type="password" 
                      className={`form-control ${errores.contraseña ? 'is-invalid' : ''}`}
                      name="contraseña" 
                      value={formData.contraseña} 
                      onChange={handleChange}
                      maxLength={LIMITES.PASSWORD.max}
                      placeholder="Minimo 6 caracteres con letras y numeros"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    {errores.contraseña && <div className="invalid-feedback">{errores.contraseña}</div>}
                    <small className="text-muted">
                      {formData.contraseña.length}/{LIMITES.PASSWORD.max} caracteres - Debe contener letras y numeros
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Telefono (opcional)
                    </label>
                    <input 
                      type="tel" 
                      className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                      name="telefono" 
                      value={formData.telefono} 
                      onChange={handleChange}
                      maxLength={LIMITES.TELEFONO.max}
                      placeholder="+56 9 1234 5678"
                      disabled={loading}
                      autoComplete="off"
                    />
                    {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                    <small className="text-muted">
                      {formData.telefono.length}/{LIMITES.TELEFONO.max} caracteres - Solo numeros, +, -, espacios
                    </small>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Pais *
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${errores.pais ? 'is-invalid' : ''}`}
                      name="pais" 
                      value={formData.pais} 
                      onChange={handleChange}
                      maxLength={LIMITES.COMUNA.max}
                      placeholder="Pais"
                      disabled={loading}
                    />
                    {errores.pais && <div className="invalid-feedback">{errores.pais}</div>}
                    <small className="text-muted">
                      {formData.pais.length}/{LIMITES.COMUNA.max} caracteres - Solo letras
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Comuna/Ciudad *
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                      name="comuna" 
                      value={formData.comuna} 
                      onChange={handleChange}
                      maxLength={LIMITES.COMUNA.max}
                      placeholder="Comuna o ciudad"
                      disabled={loading}
                    />
                    {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
                    <small className="text-muted">
                      {formData.comuna.length}/{LIMITES.COMUNA.max} caracteres
                    </small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Direccion *
                  </label>
                  <input 
                    type="text" 
                    className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange}
                    maxLength={LIMITES.DIRECCION.max}
                    placeholder="Ingresa tu direccion completa"
                    disabled={loading}
                  />
                  {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                  <small className="text-muted">
                    {formData.direccion.length}/{LIMITES.DIRECCION.max} caracteres
                  </small>
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
                  ¿Ya tienes cuenta? Inicia sesion aqui
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