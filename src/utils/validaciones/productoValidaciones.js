import { PRODUCT_LIMITS, VALIDATION_MESSAGES, VALIDATION_PATTERNS } from '../constants/validationRules';

/**
 * Validaciones específicas para productos
 * Siguiendo el mismo estándar del sistema de validaciones existente
 */

/**
 * Valida el nombre del producto
 * @param {string} nombre - Nombre a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarNombreProducto = (nombre) => {
  if (!nombre || nombre.trim() === '') {
    return VALIDATION_MESSAGES.NOMBRE.REQUIRED;
  }
  
  const nombreLimpio = nombre.trim();
  
  if (nombreLimpio.length < PRODUCT_LIMITS.NOMBRE.min) {
    return VALIDATION_MESSAGES.NOMBRE.MIN_LENGTH;
  }
  
  if (nombreLimpio.length > PRODUCT_LIMITS.NOMBRE.max) {
    return VALIDATION_MESSAGES.NOMBRE.MAX_LENGTH;
  }
  
  if (!PRODUCT_LIMITS.NOMBRE.pattern.test(nombreLimpio)) {
    return VALIDATION_MESSAGES.NOMBRE.INVALID_CHARS;
  }
  
  return null;
};

/**
 * Valida la descripción del producto
 * @param {string} descripcion - Descripción a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarDescripcionProducto = (descripcion) => {
  if (!descripcion || descripcion.trim() === '') {
    return VALIDATION_MESSAGES.DESCRIPCION.REQUIRED;
  }
  
  const descripcionLimpia = descripcion.trim();
  
  if (descripcionLimpia.length < PRODUCT_LIMITS.DESCRIPCION.min) {
    return VALIDATION_MESSAGES.DESCRIPCION.MIN_LENGTH;
  }
  
  if (descripcionLimpia.length > PRODUCT_LIMITS.DESCRIPCION.max) {
    return VALIDATION_MESSAGES.DESCRIPCION.MAX_LENGTH;
  }
  
  return null;
};

/**
 * Valida la cantidad del producto
 * @param {number|string} cantidad - Cantidad a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarCantidadProducto = (cantidad) => {
  if (cantidad === '' || cantidad === null || cantidad === undefined) {
    return VALIDATION_MESSAGES.CANTIDAD.REQUIRED;
  }
  
  const cantidadNum = parseInt(cantidad);
  
  if (isNaN(cantidadNum)) {
    return VALIDATION_MESSAGES.CANTIDAD.INVALID_NUMBER;
  }
  
  if (cantidadNum < PRODUCT_LIMITS.CANTIDAD.min) {
    return VALIDATION_MESSAGES.CANTIDAD.MIN_VALUE;
  }
  
  if (cantidadNum > PRODUCT_LIMITS.CANTIDAD.max) {
    return VALIDATION_MESSAGES.CANTIDAD.MAX_VALUE;
  }
  
  return null;
};

/**
 * Valida el precio del producto
 * @param {number|string} precio - Precio a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarPrecioProducto = (precio) => {
  // El precio puede ser 0 (productos gratuitos)
  if (precio === '' || precio === null || precio === undefined) {
    return VALIDATION_MESSAGES.PRECIO.MIN_VALUE;
  }
  
  const precioNum = parseFloat(precio);
  
  if (isNaN(precioNum)) {
    return VALIDATION_MESSAGES.PRECIO.INVALID_NUMBER;
  }
  
  if (precioNum < PRODUCT_LIMITS.PRECIO.min) {
    return VALIDATION_MESSAGES.PRECIO.MIN_VALUE;
  }
  
  if (precioNum > PRODUCT_LIMITS.PRECIO.max) {
    return VALIDATION_MESSAGES.PRECIO.MAX_VALUE;
  }
  
  // Validar que tenga máximo 2 decimales
  if (!VALIDATION_PATTERNS.PRICE.test(precio.toString())) {
    return 'El precio debe tener máximo 2 decimales';
  }
  
  return null;
};

/**
 * Valida la fecha de vencimiento
 * @param {string} fechaVencimiento - Fecha a validar (formato YYYY-MM-DD)
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarFechaVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento || fechaVencimiento.trim() === '') {
    return VALIDATION_MESSAGES.VENCIMIENTO.REQUIRED;
  }
  
  const fecha = new Date(fechaVencimiento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Resetear hora para comparación solo de fecha
  
  if (isNaN(fecha.getTime())) {
    return VALIDATION_MESSAGES.VENCIMIENTO.INVALID_DATE;
  }
  
  // La fecha puede ser hoy o futura
  if (fecha < hoy) {
    return VALIDATION_MESSAGES.VENCIMIENTO.PAST_DATE;
  }
  
  // Validar que no sea más de 5 años en el futuro
  const cincoAnios = new Date();
  cincoAnios.setFullYear(cincoAnios.getFullYear() + 5);
  
  if (fecha > cincoAnios) {
    return VALIDATION_MESSAGES.VENCIMIENTO.TOO_FAR;
  }
  
  return null;
};

/**
 * Valida la categoría del producto
 * @param {string} categoria - Categoría a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarCategoriaProducto = (categoria) => {
  if (!categoria || categoria.trim() === '') {
    return 'La categoría es obligatoria';
  }
  
  const categoriasPermitidas = ['frutas', 'verduras', 'lacteos', 'carnes', 'panaderia', 'otros'];
  
  if (!categoriasPermitidas.includes(categoria)) {
    return 'Categoría no válida';
  }
  
  return null;
};

/**
 * Valida URL de imagen (opcional)
 * @param {string} imagen - URL de imagen
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarImagenProducto = (imagen) => {
  // Es opcional, así que si está vacía es válida
  if (!imagen || imagen.trim() === '') {
    return null;
  }
  
  const urlPattern = /^https?:\/\/.+\..+/;
  
  if (!urlPattern.test(imagen)) {
    return 'La URL de la imagen no es válida';
  }
  
  return null;
};

/**
 * Formatea el input según el tipo de campo de producto
 * @param {string} valor - Valor a formatear
 * @param {string} tipo - Tipo de campo
 * @returns {string} - Valor formateado
 */
export const formatearInputProducto = (valor, tipo) => {
  switch (tipo) {
    case 'nombre':
      // Permitir letras, números, espacios y algunos caracteres especiales
      return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-.,()]/g, '');
    
    case 'descripcion':
      // Permitir cualquier carácter excepto HTML tags
      return valor.replace(/<[^>]*>/g, '');
    
    case 'cantidad':
      // Solo números enteros
      return valor.replace(/[^0-9]/g, '');
    
    case 'precio':
      // Números con hasta 2 decimales
      return valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
    
    case 'imagen':
      // Limpiar espacios
      return valor.trim();
    
    default:
      return valor;
  }
};

/**
 * Valida todo el formulario de producto
 * @param {Object} datosProducto - Datos del formulario
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioProducto = (datosProducto) => {
  const errores = {};
  
  // Validar nombre
  const errorNombre = validarNombreProducto(datosProducto.nombre);
  if (errorNombre) errores.nombre = errorNombre;
  
  // Validar descripción
  const errorDescripcion = validarDescripcionProducto(datosProducto.descripcion);
  if (errorDescripcion) errores.descripcion = errorDescripcion;
  
  // Validar categoría
  const errorCategoria = validarCategoriaProducto(datosProducto.categoria);
  if (errorCategoria) errores.categoria = errorCategoria;
  
  // Validar precio
  const errorPrecio = validarPrecioProducto(datosProducto.precio);
  if (errorPrecio) errores.precio = errorPrecio;
  
  // Validar cantidad
  const errorCantidad = validarCantidadProducto(datosProducto.cantidad);
  if (errorCantidad) errores.cantidad = errorCantidad;
  
  // Validar fecha de vencimiento
  const errorVencimiento = validarFechaVencimiento(datosProducto.vencimiento);
  if (errorVencimiento) errores.vencimiento = errorVencimiento;
  
  // Validar imagen (opcional)
  const errorImagen = validarImagenProducto(datosProducto.imagen);
  if (errorImagen) errores.imagen = errorImagen;
  
  // Validaciones cruzadas
  if (datosProducto.estado === 'agotado' && parseInt(datosProducto.cantidad) !== 0) {
    errores.cantidad = 'La cantidad debe ser 0 cuando el producto está agotado';
  }
  
  return errores;
};

/**
 * Obtiene el contador de caracteres para mostrar en el formulario
 * @param {string} valor - Valor actual
 * @param {string} campo - Campo a evaluar
 * @returns {Object} - Información del contador
 */
export const obtenerContadorCaracteres = (valor, campo) => {
  const longitud = valor ? valor.length : 0;
  let limite;
  
  switch (campo) {
    case 'nombre':
      limite = PRODUCT_LIMITS.NOMBRE.max;
      break;
    case 'descripcion':
      limite = PRODUCT_LIMITS.DESCRIPCION.max;
      break;
    default:
      return null;
  }
  
  return {
    actual: longitud,
    limite: limite,
    restantes: limite - longitud,
    porcentaje: (longitud / limite) * 100,
    esLimite: longitud >= limite,
    esCercaDelLimite: longitud >= limite * 0.9
  };
};

export default {
  validarNombreProducto,
  validarDescripcionProducto,
  validarCantidadProducto,
  validarPrecioProducto,
  validarFechaVencimiento,
  validarCategoriaProducto,
  validarImagenProducto,
  formatearInputProducto,
  validarFormularioProducto,
  obtenerContadorCaracteres
};