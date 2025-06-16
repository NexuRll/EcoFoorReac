import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmpresaInfo from '../../components/empresa/perfil/EmpresaInfo';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import InputField from '../../components/common/forms/InputField';
import SelectField from '../../components/common/forms/SelectField';
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
    descripcion: '',
    sitioWeb: '',
    redesSociales: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  const [errors, setErrors] = useState({});

  // Opciones para selectores
  const paisesOptions = [
    { value: 'Chile', label: 'Chile' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Perú', label: 'Perú' },
    { value: 'Colombia', label: 'Colombia' }
  ];

  const comunasChileOptions = [
    { value: 'Santiago', label: 'Santiago' },
    { value: 'Valparaíso', label: 'Valparaíso' },
    { value: 'Concepción', label: 'Concepción' },
    { value: 'La Serena', label: 'La Serena' },
    { value: 'Antofagasta', label: 'Antofagasta' },
    { value: 'Temuco', label: 'Temuco' },
    { value: 'Rancagua', label: 'Rancagua' },
    { value: 'Talca', label: 'Talca' },
    { value: 'Arica', label: 'Arica' },
    { value: 'Chillán', label: 'Chillán' }
  ];

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
          descripcion: userData.descripcion || '',
          sitioWeb: userData.sitioWeb || '',
          redesSociales: {
            facebook: userData.redesSociales?.facebook || '',
            instagram: userData.redesSociales?.instagram || '',
            twitter: userData.redesSociales?.twitter || ''
          }
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
    }

    if (formData.telefono && !/^\+?[\d\s\-\(\)]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.pais) {
      newErrors.pais = 'Selecciona un país';
    }

    if (!formData.comuna) {
      newErrors.comuna = 'Selecciona una comuna';
    }

    if (formData.sitioWeb && !/^https?:\/\/.+\..+/.test(formData.sitioWeb)) {
      newErrors.sitioWeb = 'URL del sitio web inválida (debe incluir http:// o https://)';
    }

    if (formData.redesSociales.facebook && !/^https?:\/\/(www\.)?facebook\.com\/.+/.test(formData.redesSociales.facebook)) {
      newErrors.facebook = 'URL de Facebook inválida';
    }

    if (formData.redesSociales.instagram && !/^https?:\/\/(www\.)?instagram\.com\/.+/.test(formData.redesSociales.instagram)) {
      newErrors.instagram = 'URL de Instagram inválida';
    }

    if (formData.redesSociales.twitter && !/^https?:\/\/(www\.)?twitter\.com\/.+/.test(formData.redesSociales.twitter)) {
      newErrors.twitter = 'URL de Twitter inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('redesSociales.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        redesSociales: {
          ...prev.redesSociales,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
                        />
                      </div>

                      <div className="col-md-6">
                        <SelectField
                          label="País"
                          name="pais"
                          value={formData.pais}
                          onChange={handleChange}
                          error={errors.pais}
                          options={paisesOptions}
                          required
                          icon="fas fa-flag"
                        />
                      </div>

                      <div className="col-md-6">
                        <SelectField
                          label="Comuna"
                          name="comuna"
                          value={formData.comuna}
                          onChange={handleChange}
                          error={errors.comuna}
                          options={comunasChileOptions}
                          required
                          icon="fas fa-map"
                        />
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

                      {/* Información web */}
                      <div className="col-12">
                        <h6 className="text-muted mb-3">
                          <i className="fas fa-globe me-2"></i>
                          Presencia Web (Opcional)
                        </h6>
                      </div>

                      <div className="col-md-6">
                        <InputField
                          label="Sitio Web"
                          name="sitioWeb"
                          value={formData.sitioWeb}
                          onChange={handleChange}
                          error={errors.sitioWeb}
                          icon="fas fa-globe"
                          placeholder="https://www.tuempresa.com"
                        />
                      </div>

                      <div className="col-md-6">
                        <InputField
                          label="Facebook"
                          name="redesSociales.facebook"
                          value={formData.redesSociales.facebook}
                          onChange={handleChange}
                          error={errors.facebook}
                          icon="fab fa-facebook"
                          placeholder="https://www.facebook.com/tuempresa"
                        />
                      </div>

                      <div className="col-md-6">
                        <InputField
                          label="Instagram"
                          name="redesSociales.instagram"
                          value={formData.redesSociales.instagram}
                          onChange={handleChange}
                          error={errors.instagram}
                          icon="fab fa-instagram"
                          placeholder="https://www.instagram.com/tuempresa"
                        />
                      </div>

                      <div className="col-md-6">
                        <InputField
                          label="Twitter"
                          name="redesSociales.twitter"
                          value={formData.redesSociales.twitter}
                          onChange={handleChange}
                          error={errors.twitter}
                          icon="fab fa-twitter"
                          placeholder="https://www.twitter.com/tuempresa"
                        />
                      </div>
                    </div>

                    {/* Información importante */}
                    <div className="alert alert-info mt-4">
                      <h6 className="alert-heading">
                        <i className="fas fa-info-circle me-2"></i>
                        Información importante:
                      </h6>
                      <ul className="mb-0">
                        <li>El <strong>email</strong> y <strong>RUT</strong> no se pueden modificar por seguridad</li>
                        <li>Los campos marcados con <span className="text-danger">*</span> son obligatorios</li>
                        <li>Las URLs de redes sociales deben incluir https://</li>
                        <li>Esta información será visible para los clientes</li>
                      </ul>
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