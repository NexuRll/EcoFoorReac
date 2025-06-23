import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmpresaInfo from '../../components/empresa/perfil/EmpresaInfo';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import InputField from '../../components/common/forms/InputField';
import SelectField from '../../components/common/forms/SelectField';
import SelectorPaisComunaAPI from '../../components/common/SelectorPaisComunaAPI';
import { empresaService } from '../../services/empresa/empresaFirebase';
import Swal from 'sweetalert2';

const PerfilEmpresa = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    pais: '',
    comuna: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});

  // Funciones para manejar cambios del selector de país y comuna
  const handlePaisChange = (pais) => {
    setFormData(prev => ({
      ...prev,
      pais: pais,
      comuna: '' // Limpiar comuna al cambiar país
    }));

    // Limpiar errores
    if (errors.pais) {
      setErrors(prev => ({
        ...prev,
        pais: '',
        comuna: '' // También limpiar error de comuna
      }));
    }
  };

  const handleComunaChange = (comuna) => {
    setFormData(prev => ({
      ...prev,
      comuna: comuna
    }));

    // Limpiar error de comuna
    if (errors.comuna) {
      setErrors(prev => ({
        ...prev,
        comuna: ''
      }));
    }
  };

  // Cargar datos de la empresa
  const cargarDatosEmpresa = async () => {
    try {
      setLoading(true);
      
      // Usar datos del contexto si están disponibles
      if (userData) {
        setEmpresaData(userData);
        setFormData({
          nombre: userData.nombre || userData.Nombre || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          pais: userData.pais || 'Chile',
          comuna: userData.comuna || '',
          descripcion: userData.descripcion || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos de empresa:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de la empresa.',
        confirmButtonColor: '#28a745'
      });
    } finally {
      setLoading(false);
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la empresa es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.telefono && !/^\+?[\d\s\-]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido (solo números, espacios, guiones y signo +)';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    } else if (formData.direccion.trim().length > 100) {
      newErrors.direccion = 'La dirección no puede exceder 100 caracteres';
    }

    if (!formData.pais) {
      newErrors.pais = 'Selecciona un país';
    }

    if (!formData.comuna) {
      newErrors.comuna = 'Selecciona una comuna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Guardar cambios
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setSaving(true);

      // Preparar datos para actualizar
      const datosActualizados = {
        ...formData,
        fechaActualizacion: new Date().toISOString()
      };

      // Actualizar en Firebase
      await empresaService.actualizarEmpresa(currentUser.uid, datosActualizados);

      // Actualizar contexto
      await updateUserData();

      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Los datos de tu empresa han sido actualizados correctamente.',
        confirmButtonColor: '#28a745',
        timer: 2000,
        showConfirmButton: false
      });

      setIsEditing(false);
      
      // Recargar datos
      cargarDatosEmpresa();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil. Intenta nuevamente.',
        confirmButtonColor: '#28a745'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    setIsEditing(false);
    setErrors({});
    cargarDatosEmpresa(); // Recargar datos originales
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosEmpresa();
  }, [userData]);

  if (loading) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  return (
    <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-0 text-success">
                  <i className="fas fa-building me-2"></i>
                  Mi Perfil Empresarial
                </h1>
                <p className="text-muted mb-0">
                  Gestiona la información de tu empresa
                </p>
              </div>
              {!isEditing ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit me-2"></i>
                  Editar Perfil
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    className="btn btn-success"
                    onClick={handleGuardar}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Guardar
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelar}
                    disabled={saving}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          {/* Vista de información (modo lectura) */}
          {!isEditing && (
            <div className="col-12">
              <EmpresaInfo empresa={empresaData} />
            </div>
          )}

          {/* Formulario de edición */}
          {isEditing && (
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-edit me-2"></i>
                    Editar Información de la Empresa
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>
                    <div className="row">
                      {/* Información básica */}
                      <div className="col-md-6">
                        <InputField
                          label="Nombre de la Empresa"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          error={errors.nombre}
                          required
                          icon="fas fa-building"
                          placeholder="Nombre de tu empresa"
                          maxLength={50}
                          helpText={`${formData.nombre.length}/50 caracteres`}
                        />
                      </div>

                      <div className="col-md-6">
                        <InputField
                          label="Teléfono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          error={errors.telefono}
                          icon="fas fa-phone"
                          placeholder="+56 9 1234 5678"
                          helpText="Solo números, espacios, guiones y signo +"
                        />
                      </div>

                      {/* Ubicación */}
                      <div className="col-12">
                        <InputField
                          label="Dirección"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          error={errors.direccion}
                          required
                          icon="fas fa-map-marker-alt"
                          placeholder="Dirección completa de la empresa"
                          maxLength={100}
                          helpText={`${formData.direccion.length}/100 caracteres`}
                        />
                      </div>

                      {/* Selector de País y Comuna con API */}
                      <div className="col-12">
                        <div className="row">
                          <div className="col-md-6">
                            <SelectorPaisComunaAPI
                              paisSeleccionado={formData.pais}
                              comunaSeleccionada={formData.comuna}
                              onPaisChange={handlePaisChange}
                              onComunaChange={handleComunaChange}
                              errores={{ pais: errors.pais, comuna: errors.comuna }}
                              disabled={saving}
                              paisLabel="País"
                              comunaLabel="Ciudad/Comuna"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Descripción de la Empresa
                          </label>
                          <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Describe tu empresa, sus valores, productos principales..."
                            maxLength="500"
                          />
                          <div className="form-text text-end">
                            <small className="text-muted">
                              {formData.descripcion.length}/500 caracteres
                            </small>
                          </div>
                        </div>
                      </div>

                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default PerfilEmpresa; 