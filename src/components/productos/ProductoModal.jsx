import React, { useState, useEffect } from 'react';
import InputField from '../common/forms/InputField';
import SelectField from '../common/forms/SelectField';
import { 
  PRODUCT_LIMITS, 
  VALIDATION_MESSAGES, 
  PRODUCT_STATUS 
} from '../../utils/constants/validationRules';
import { getCurrentDate, getTomorrowDate, isValidDate } from '../../utils/helpers/dateUtils';

const ProductoModal = ({ 
  show, 
  onHide, 
  onSave, 
  producto = null, 
  loading = false 
}) => {
  const isEditing = !!producto;
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    vencimiento: '',
    cantidad: '',
    precio: '',
    estado: PRODUCT_STATUS.DISPONIBLE
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (show) {
      if (isEditing && producto) {
        setFormData({
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          vencimiento: producto.vencimiento || '',
          cantidad: producto.cantidad?.toString() || '',
          precio: producto.precio?.toString() || '',
          estado: producto.estado || PRODUCT_STATUS.DISPONIBLE
        });
      } else {
        // Valores por defecto para nuevo producto
        setFormData({
          nombre: '',
          descripcion: '',
          vencimiento: getTomorrowDate(), // Por defecto mañana
          cantidad: '',
          precio: '0', // Por defecto gratuito
          estado: PRODUCT_STATUS.DISPONIBLE
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [show, isEditing, producto]);

  // Validar campo individual
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = VALIDATION_MESSAGES.NOMBRE.REQUIRED;
        } else if (value.trim().length < PRODUCT_LIMITS.NOMBRE.min) {
          error = VALIDATION_MESSAGES.NOMBRE.MIN_LENGTH;
        } else if (value.trim().length > PRODUCT_LIMITS.NOMBRE.max) {
          error = VALIDATION_MESSAGES.NOMBRE.MAX_LENGTH;
        } else if (!PRODUCT_LIMITS.NOMBRE.pattern.test(value.trim())) {
          error = VALIDATION_MESSAGES.NOMBRE.INVALID_CHARS;
        }
        break;

      case 'descripcion':
        if (!value.trim()) {
          error = VALIDATION_MESSAGES.DESCRIPCION.REQUIRED;
        } else if (value.trim().length < PRODUCT_LIMITS.DESCRIPCION.min) {
          error = VALIDATION_MESSAGES.DESCRIPCION.MIN_LENGTH;
        } else if (value.trim().length > PRODUCT_LIMITS.DESCRIPCION.max) {
          error = VALIDATION_MESSAGES.DESCRIPCION.MAX_LENGTH;
        }
        break;

      case 'vencimiento':
        if (!value) {
          error = VALIDATION_MESSAGES.VENCIMIENTO.REQUIRED;
        } else if (!isValidDate(value)) {
          error = VALIDATION_MESSAGES.VENCIMIENTO.INVALID_DATE;
        } else {
          const today = new Date();
          const selectedDate = new Date(value);
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() + 5);
          
          if (selectedDate < today.setHours(0, 0, 0, 0)) {
            error = VALIDATION_MESSAGES.VENCIMIENTO.PAST_DATE;
          } else if (selectedDate > maxDate) {
            error = VALIDATION_MESSAGES.VENCIMIENTO.TOO_FAR;
          }
        }
        break;

      case 'cantidad':
        if (!value.trim()) {
          error = VALIDATION_MESSAGES.CANTIDAD.REQUIRED;
        } else {
          const num = parseInt(value);
          if (isNaN(num)) {
            error = VALIDATION_MESSAGES.CANTIDAD.INVALID_NUMBER;
          } else if (num < PRODUCT_LIMITS.CANTIDAD.min) {
            error = VALIDATION_MESSAGES.CANTIDAD.MIN_VALUE;
          } else if (num > PRODUCT_LIMITS.CANTIDAD.max) {
            error = VALIDATION_MESSAGES.CANTIDAD.MAX_VALUE;
          }
        }
        break;

      case 'precio':
        if (value.trim() !== '') {
          const num = parseFloat(value);
          if (isNaN(num)) {
            error = VALIDATION_MESSAGES.PRECIO.INVALID_NUMBER;
          } else if (num < PRODUCT_LIMITS.PRECIO.min) {
            error = VALIDATION_MESSAGES.PRECIO.MIN_VALUE;
          } else if (num > PRODUCT_LIMITS.PRECIO.max) {
            error = VALIDATION_MESSAGES.PRECIO.MAX_VALUE;
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    const fields = ['nombre', 'descripcion', 'vencimiento', 'cantidad', 'precio'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productoData = {
      ...formData,
      cantidad: parseInt(formData.cantidad),
      precio: parseFloat(formData.precio) || 0,
      fechaActualizacion: new Date().toISOString()
    };

    if (!isEditing) {
      productoData.fechaCreacion = new Date().toISOString();
    }

    onSave(productoData);
  };

  // Determinar si el producto será gratuito
  const isGratuito = parseFloat(formData.precio) === 0;

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Nombre del producto */}
                <div className="col-md-6">
                  <InputField
                    label="Nombre del Producto"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.nombre}
                    placeholder="Ej: Tomates Cherry"
                    required
                    maxLength={PRODUCT_LIMITS.NOMBRE.max}
                    icon="fas fa-box"
                  />
                </div>

                {/* Estado */}
                <div className="col-md-6">
                  <SelectField
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    options={[
                      { value: PRODUCT_STATUS.DISPONIBLE, label: 'Disponible' },
                      { value: PRODUCT_STATUS.AGOTADO, label: 'Agotado' }
                    ]}
                    icon="fas fa-flag"
                  />
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Descripción <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                      placeholder="Describe el producto, su origen, características especiales..."
                      rows="3"
                      maxLength={PRODUCT_LIMITS.DESCRIPCION.max}
                      required
                    />
                    {errors.descripcion && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.descripcion}
                      </div>
                    )}
                    <div className="form-text text-end">
                      <small className={`${formData.descripcion.length > PRODUCT_LIMITS.DESCRIPCION.max * 0.9 ? 'text-warning' : 'text-muted'}`}>
                        {formData.descripcion.length}/{PRODUCT_LIMITS.DESCRIPCION.max}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Fecha de vencimiento */}
                <div className="col-md-4">
                  <InputField
                    label="Fecha de Vencimiento"
                    name="vencimiento"
                    type="date"
                    value={formData.vencimiento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.vencimiento}
                    required
                    min={getCurrentDate()}
                    icon="fas fa-calendar-alt"
                    helpText="No puede ser anterior a hoy"
                  />
                </div>

                {/* Cantidad */}
                <div className="col-md-4">
                  <InputField
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.cantidad}
                    placeholder="0"
                    required
                    min={PRODUCT_LIMITS.CANTIDAD.min}
                    max={PRODUCT_LIMITS.CANTIDAD.max}
                    icon="fas fa-cubes"
                  />
                </div>

                {/* Precio */}
                <div className="col-md-4">
                  <InputField
                    label="Precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.precio}
                    placeholder="0.00"
                    min={PRODUCT_LIMITS.PRECIO.min}
                    max={PRODUCT_LIMITS.PRECIO.max}
                    icon="fas fa-dollar-sign"
                    helpText={isGratuito ? "Producto gratuito" : "Precio en pesos chilenos"}
                  />
                </div>
              </div>

              {/* Alertas informativas */}
              {isGratuito && (
                <div className="alert alert-info mt-3">
                  <i className="fas fa-gift me-2"></i>
                  <strong>Producto Gratuito:</strong> Este producto será marcado como gratuito y tendrá mayor visibilidad.
                </div>
              )}

              {formData.vencimiento && (
                <div className="alert alert-warning mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Recordatorio:</strong> Si el producto vence en 3 días o menos, se mostrará una advertencia automáticamente.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onHide}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                    {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductoModal; 