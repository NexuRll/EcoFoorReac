import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { validarEmailUnicoConDebounce } from '../services/validacionesUnicas';
import SelectorPaisComunaAPI from '../components/SelectorPaisComunaAPI';

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

  // Estado para validación única de email
  const [validacionEmail, setValidacionEmail] = useState({
    validando: false,
    esUnico: null,
    mensaje: null,
    error: null
  });

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

    // Validación en tiempo real para email único
    if (name === 'correo' && value.length >= 5) {
      validarEmailUnicoConDebounce(value, null, setValidacionEmail);
    } else if (name === 'correo') {
      setValidacionEmail({ validando: false, esUnico: null, mensaje: null, error: null });
    }
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
    if (!formData.pais) nuevosErrores.pais = 'El país es obligatorio';
    if (!formData.comuna) nuevosErrores.comuna = 'La comuna es obligatoria';
    if (!formData.direccion) nuevosErrores.direccion = 'La dirección es obligatoria';
    
    // Agregar error de email único si es necesario
    if (validacionEmail.esUnico === false) {
      nuevosErrores.correo = validacionEmail.mensaje;
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      setLoading(true);
      try {
        await signup(formData);
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          html: `
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p><strong>IMPORTANTE:</strong> Se ha enviado un correo de verificación a <b>${formData.correo}</b>.</p>
            <p>Debes verificar tu correo electrónico antes de poder iniciar sesión.</p>
            <p>Revisa tu bandeja de entrada y haz clic en el enlace de verificación.</p>
          `,
          confirmButtonText: 'Entendido'
        }).then(() => {
          navigate('/login');
        });
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
                  <div className="position-relative">
                    <input 
                      type="email" 
                      className={`form-control ${
                        errores.correo ? 'is-invalid' : 
                        validacionEmail.esUnico === false ? 'is-invalid' :
                        validacionEmail.esUnico === true ? 'is-valid' : ''
                      }`}
                      name="correo" 
                      value={formData.correo} 
                      onChange={handleChange} 
                      disabled={loading}
                    />
                    {validacionEmail.validando && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Verificando...</span>
                        </div>
                      </div>
                    )}
                    {validacionEmail.esUnico === true && !validacionEmail.validando && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                        <i className="fas fa-check-circle text-success"></i>
                      </div>
                    )}
                    {validacionEmail.esUnico === false && !validacionEmail.validando && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                        <i className="fas fa-times-circle text-danger"></i>
                      </div>
                    )}
                  </div>
                  {errores.correo && <p className="text-danger">{errores.correo}</p>}
                  {!errores.correo && validacionEmail.mensaje && (
                    <div className={`small mt-1 ${
                      validacionEmail.esUnico === false ? 'text-danger' : 
                      validacionEmail.esUnico === true ? 'text-success' : 'text-info'
                    }`}>
                      <i className={`fas ${
                        validacionEmail.esUnico === false ? 'fa-exclamation-triangle' :
                        validacionEmail.esUnico === true ? 'fa-check' : 'fa-info-circle'
                      } me-1`}></i>
                      {validacionEmail.mensaje}
                    </div>
                  )}
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

                {/* Selector de País y Comuna con APIs */}
                <SelectorPaisComunaAPI
                  paisSeleccionado={formData.pais}
                  comunaSeleccionada={formData.comuna}
                  onPaisChange={(pais) => setFormData({ ...formData, pais })}
                  onComunaChange={(comuna) => setFormData({ ...formData, comuna })}
                  errores={errores}
                  disabled={loading}
                />

                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange}
                    placeholder="Ej: Calle 123 #45-67, Apartamento 8B"
                    disabled={loading}
                  />
                  {errores.direccion && <p className="text-danger">{errores.direccion}</p>}
                  <div className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Ingresa tu dirección completa (calle, número, apartamento, etc.)
                  </div>
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
