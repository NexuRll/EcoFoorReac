import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

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
    categoria: '',
    precio: '',
    cantidad: '',
    fechaVencimiento: '',
    estado: 'disponible',
    imagen: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',
        precio: producto.precio || '',
        cantidad: producto.cantidad || '',
        fechaVencimiento: producto.fechaVencimiento || '',
        estado: producto.estado || 'disponible',
        imagen: producto.imagen || ''
      });
    } else {
      // Limpiar formulario para nuevo producto
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        cantidad: '',
        fechaVencimiento: '',
        estado: 'disponible',
        imagen: ''
      });
    }
    setErrores({});
  }, [producto, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
        [name]: value
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
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!formData.categoria.trim()) {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    }

    if (!formData.precio || formData.precio < 0) {
      nuevosErrores.precio = 'El precio debe ser mayor o igual a 0';
    }

    if (!formData.cantidad || formData.cantidad < 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser mayor o igual a 0';
    }

    if (formData.estado === 'agotado' && formData.cantidad !== '0') {
      nuevosErrores.cantidad = 'La cantidad debe ser 0 cuando el producto está agotado';
    }

    if (!formData.fechaVencimiento) {
      nuevosErrores.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormulario();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

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

      await onSave(productoData, producto?.id);
      
      Swal.fire({
        icon: 'success',
        title: producto ? 'Producto actualizado' : 'Producto creado',
        text: `El producto se ha ${producto ? 'actualizado' : 'creado'} correctamente`,
        timer: 1500,
        showConfirmButton: false
      });

      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
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
                    placeholder="Ej: Manzanas Rojas"
                    disabled={loading}
                  />
                  {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Categoría *</label>
                  <select
                    className={`form-select ${errores.categoria ? 'is-invalid' : ''}`}
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="frutas">Frutas</option>
                    <option value="verduras">Verduras</option>
                    <option value="lacteos">Lácteos</option>
                    <option value="carnes">Carnes</option>
                    <option value="panaderia">Panadería</option>
                    <option value="otros">Otros</option>
                  </select>
                  {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción del producto..."
                  disabled={loading}
                />
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Precio *</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control ${errores.precio ? 'is-invalid' : ''}`}
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={loading}
                    />
                    {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    className={`form-control ${errores.cantidad ? 'is-invalid' : ''}`}
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    disabled={loading || formData.estado === 'agotado'}
                  />
                  {errores.cantidad && <div className="invalid-feedback">{errores.cantidad}</div>}
                  {formData.estado === 'agotado' && (
                    <small className="text-muted">Cantidad bloqueada porque el producto está agotado</small>
                  )}
                </div>

                <div className="col-md-4 mb-3">
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
                    <option value="proximo_vencer">Próximo a Vencer</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha de Vencimiento *</label>
                <input
                  type="date"
                  className={`form-control ${errores.fechaVencimiento ? 'is-invalid' : ''}`}
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.fechaVencimiento && <div className="invalid-feedback">{errores.fechaVencimiento}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">URL de Imagen (opcional)</label>
                <input
                  type="url"
                  className="form-control"
                  name="imagen"
                  value={formData.imagen}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={loading}
                />
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