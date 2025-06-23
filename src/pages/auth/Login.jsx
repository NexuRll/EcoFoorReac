import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
      
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirigir según el tipo de usuario
      if (user?.tipo === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.tipo === 'empresa') {
        navigate('/empresa/dashboard');
      } else {
        navigate('/cliente/productos');
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message.includes('invalid-credential') || error.message.includes('user-not-found')) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
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
              </form>
              
              <div className="text-center mt-3">
                <Link to="/register" className="text-decoration-none">
                  ¿No tienes cuenta? Regístrate aquí
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
} 