import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  validarFormularioProducto,
  formatearInputProducto,
  obtenerContadorCaracteres 
} from '../../utils/validaciones/productoValidaciones';
import { PRODUCT_LIMITS } from '../../utils/constants/validationRules';

const ProductoModal = ({ 
  isOpen, 
  onClose, 
  producto = null, 
  onSave,
  empresaId 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    vencimiento: '',
    estado: 'disponible'
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        cantidad: producto.cantidad || '',
        vencimiento: producto.vencimiento || '',
        estado: producto.estado || 'disponible'
      });
    } else {
      // Limpiar formulario para nuevo producto
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad: '',
        vencimiento: '',
        estado: 'disponible'
      });
    }
    setErrores({});
  }, [producto, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear el valor según el tipo de campo
    let valorFormateado = value;
    
    if (name === 'nombre') {
      valorFormateado = formatearInputProducto(value, 'nombre');
      // Aplicar límite de caracteres
      if (valorFormateado.length > PRODUCT_LIMITS.NOMBRE.max) {
        valorFormateado = valorFormateado.substring(0, PRODUCT_LIMITS.NOMBRE.max);
      }
    } else if (name === 'descripcion') {
      valorFormateado = formatearInputProducto(value, 'descripcion');
      // Aplicar límite de caracteres
      if (valorFormateado.length > PRODUCT_LIMITS.DESCRIPCION.max) {
        valorFormateado = valorFormateado.substring(0, PRODUCT_LIMITS.DESCRIPCION.max);
      }
    } else if (name === 'cantidad') {
      valorFormateado = formatearInputProducto(value, 'cantidad');
      // Verificar límite numérico
      const cantidadNum = parseInt(valorFormateado);
      if (!isNaN(cantidadNum) && cantidadNum > PRODUCT_LIMITS.CANTIDAD.max) {
        valorFormateado = PRODUCT_LIMITS.CANTIDAD.max.toString();
      }
    } else if (name === 'precio') {
      valorFormateado = formatearInputProducto(value, 'precio');
      // Verificar límite numérico
      const precioNum = parseFloat(valorFormateado);
      if (!isNaN(precioNum) && precioNum > PRODUCT_LIMITS.PRECIO.max) {
        valorFormateado = PRODUCT_LIMITS.PRECIO.max.toString();
      }
    }
    
    // Lógica especial para cantidad cuando el estado es "agotado"
    if (name === 'estado' && value === 'agotado') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cantidad: '0'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: valorFormateado
      }));
    }

    // Limpiar errores
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    // Usar el sistema de validación robusto
    const erroresValidacion = validarFormularioProducto(formData);
    return erroresValidacion;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Enviando formulario con datos:', formData);
    
    const erroresValidacion = validarFormulario();
    console.log('🔍 Errores de validación:', erroresValidacion);
    
    if (Object.keys(erroresValidacion).length > 0) {
      console.log('❌ Formulario inválido, mostrando errores');
      setErrores(erroresValidacion);
      return;
    }

    console.log('✅ Formulario válido, enviando...');
    setLoading(true);
    
    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad),
        empresaId: empresaId,
        fechaCreacion: producto ? producto.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      console.log('📦 Datos del producto a enviar:', productoData);
      
      await onSave(productoData, producto?.id);
      
      console.log('✅ Producto guardado exitosamente');
      
      Swal.fire({
        icon: 'success',
        title: producto ? 'Producto actualizado' : 'Producto creado',
        text: `El producto se ha ${producto ? 'actualizado' : 'creado'} correctamente`,
        timer: 1500,
        showConfirmButton: false
      });

      onClose();
    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al ${producto ? 'actualizar' : 'crear'} el producto`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-box me-2"></i>
              {producto ? 'Editar Producto' : 'Nuevo Producto'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
            <div className="row">
            <div className="col-md-6 mb-3">
            <label className="form-label">Nombre del Producto *</label>
            <input
            type="text"
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Manzanas Rojas Orgánicas"
            disabled={loading}
            maxLength={PRODUCT_LIMITS.NOMBRE.max}
            />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            {/* Contador de caracteres */}
            {(() => {
            const contador = obtenerContadorCaracteres(formData.nombre, 'nombre');
            if (contador) {
            return (
            <small className={`form-text ${
            contador.esCercaDelLimite ? 'text-warning' : 'text-muted'
            }`}>
            {contador.actual}/{contador.limite} caracteres
            </small>
            );
            }
            return null;
            })()}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Estado</label>
                  <select
                className="form-select"
              name="estado"
              value={formData.estado}
            onChange={handleChange}
            disabled={loading}
            >
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
            </select>
            </div>
            </div>

              <div className="mb-3">
                <label className="form-label">Descripción *</label>
                <textarea
                  className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe las características del producto, origen, beneficios, etc..."
                  disabled={loading}
                  maxLength={PRODUCT_LIMITS.DESCRIPCION.max}
                />
                {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
                {/* Contador de caracteres */}
                {(() => {
                  const contador = obtenerContadorCaracteres(formData.descripcion, 'descripcion');
                  if (contador) {
                    return (
                      <small className={`form-text ${
                      contador.esCercaDelLimite ? 'text-warning' : 'text-muted'
                      }`}>
                      {contador.actual}/{contador.limite} caracteres
                      </small>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Precio * (CLP)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control ${errores.precio ? 'is-invalid' : ''}`}
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      min="0"
                      max={PRODUCT_LIMITS.PRECIO.max}
                      step="0.01"
                      placeholder="0.00"
                      disabled={loading}
                    />
                    {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
                  </div>
                  <small className="form-text text-muted">
                    Máximo: ${PRODUCT_LIMITS.PRECIO.max.toLocaleString()} | 
                    <span className="text-info">Usa 0 para productos gratuitos</span>
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Cantidad * (unidades)</label>
                  <input
                    type="number"
                    className={`form-control ${errores.cantidad ? 'is-invalid' : ''}`}
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="0"
                    max={PRODUCT_LIMITS.CANTIDAD.max}
                    placeholder="0"
                    disabled={loading || formData.estado === 'agotado'}
                  />
                  {errores.cantidad && <div className="invalid-feedback">{errores.cantidad}</div>}
                  {formData.estado === 'agotado' ? (
                    <small className="text-warning">
                      <i className="fas fa-lock me-1"></i>
                      Cantidad bloqueada porque el producto está agotado
                    </small>
                  ) : (
                    <small className="form-text text-muted">
                      Máximo: {PRODUCT_LIMITS.CANTIDAD.max.toLocaleString()} unidades
                    </small>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha de Vencimiento *</label>
                <input
                  type="date"
                  className={`form-control ${errores.vencimiento ? 'is-invalid' : ''}`}
                  name="vencimiento"
                  value={formData.vencimiento}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.vencimiento && <div className="invalid-feedback">{errores.vencimiento}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {producto ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {producto ? 'Actualizar' : 'Crear'} Producto
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