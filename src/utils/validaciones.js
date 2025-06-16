// Límites de caracteres para diferentes campos
export const LIMITES = {
  NOMBRE: { min: 2, max: 50 },
  EMAIL: { min: 5, max: 100 },
  PASSWORD: { min: 6, max: 20 },
  TELEFONO: { min: 8, max: 15 },
  DIRECCION: { min: 5, max: 100 },
  COMUNA: { min: 2, max: 50 },
  RUT: { min: 9, max: 12 },
  EMPRESA_NOMBRE: { min: 2, max: 80 }
};

// Expresiones regulares para validaciones
export const REGEX = {
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  SOLO_NUMEROS: /^[0-9]+$/,
  TELEFONO: /^[+]?[\d\s\-()]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  RUT: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  ALFANUMERICO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/
};

/**
 * Valida un campo de nombre (solo letras y espacios)
 * @param {string} valor - Valor a validar
 * @param {string} nombreCampo - Nombre del campo para mensajes de error
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarNombre = (valor, nombreCampo = 'Nombre') => {
  if (!valor || valor.trim() === '') {
    return `${nombreCampo} es requerido`;
  }
  
  const valorLimpio = valor.trim();
  
  if (valorLimpio.length < LIMITES.NOMBRE.min) {
    return `${nombreCampo} debe tener al menos ${LIMITES.NOMBRE.min} caracteres`;
  }
  
  if (valorLimpio.length > LIMITES.NOMBRE.max) {
    return `${nombreCampo} no puede exceder ${LIMITES.NOMBRE.max} caracteres`;
  }
  
  if (!REGEX.SOLO_LETRAS.test(valorLimpio)) {
    return `${nombreCampo} solo puede contener letras y espacios`;
  }
  
  return null;
};

/**
 * Valida un campo de email
 * @param {string} email - Email a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email es requerido';
  }
  
  const emailLimpio = email.trim();
  
  if (emailLimpio.length < LIMITES.EMAIL.min) {
    return `Email debe tener al menos ${LIMITES.EMAIL.min} caracteres`;
  }
  
  if (emailLimpio.length > LIMITES.EMAIL.max) {
    return `Email no puede exceder ${LIMITES.EMAIL.max} caracteres`;
  }
  
  if (!REGEX.EMAIL.test(emailLimpio)) {
    return 'Formato de email inválido';
  }
  
  return null;
};

/**
 * Valida un campo de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarPassword = (password) => {
  if (!password || password.trim() === '') {
    return 'Contraseña es requerida';
  }
  
  if (password.length < LIMITES.PASSWORD.min) {
    return `Contraseña debe tener al menos ${LIMITES.PASSWORD.min} caracteres`;
  }
  
  if (password.length > LIMITES.PASSWORD.max) {
    return `Contraseña no puede exceder ${LIMITES.PASSWORD.max} caracteres`;
  }
  
  if (!REGEX.PASSWORD.test(password)) {
    return 'Contraseña debe contener al menos una letra y un número';
  }
  
  return null;
};

/**
 * Valida un campo de teléfono
 * @param {string} telefono - Teléfono a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono || telefono.trim() === '') {
    return 'Teléfono es requerido';
  }
  
  const telefonoLimpio = telefono.trim();
  
  if (telefonoLimpio.length < LIMITES.TELEFONO.min) {
    return `Teléfono debe tener al menos ${LIMITES.TELEFONO.min} caracteres`;
  }
  
  if (telefonoLimpio.length > LIMITES.TELEFONO.max) {
    return `Teléfono no puede exceder ${LIMITES.TELEFONO.max} caracteres`;
  }
  
  if (!REGEX.TELEFONO.test(telefonoLimpio)) {
    return 'Teléfono solo puede contener números, espacios, guiones y paréntesis';
  }
  
  return null;
};

/**
 * Valida un campo de dirección
 * @param {string} direccion - Dirección a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarDireccion = (direccion) => {
  if (!direccion || direccion.trim() === '') {
    return 'Dirección es requerida';
  }
  
  const direccionLimpia = direccion.trim();
  
  if (direccionLimpia.length < LIMITES.DIRECCION.min) {
    return `Dirección debe tener al menos ${LIMITES.DIRECCION.min} caracteres`;
  }
  
  if (direccionLimpia.length > LIMITES.DIRECCION.max) {
    return `Dirección no puede exceder ${LIMITES.DIRECCION.max} caracteres`;
  }
  
  if (!REGEX.ALFANUMERICO.test(direccionLimpia)) {
    return 'Dirección contiene caracteres no válidos';
  }
  
  return null;
};

/**
 * Valida un campo de país
 * @param {string} pais - País a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarPais = (pais) => {
  if (!pais || pais.trim() === '') {
    return 'País es requerido';
  }
  
  return null;
};

/**
 * Valida un campo de comuna
 * @param {string} comuna - Comuna a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarComuna = (comuna) => {
  if (!comuna || comuna.trim() === '') {
    return 'Comuna es requerida';
  }
  
  const comunaLimpia = comuna.trim();
  
  if (comunaLimpia.length < LIMITES.COMUNA.min) {
    return `Comuna debe tener al menos ${LIMITES.COMUNA.min} caracteres`;
  }
  
  if (comunaLimpia.length > LIMITES.COMUNA.max) {
    return `Comuna no puede exceder ${LIMITES.COMUNA.max} caracteres`;
  }
  
  // Nota: Removemos la validación SOLO_LETRAS porque las comunas pueden tener números y otros caracteres
  
  return null;
};

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarRut = (rut) => {
  if (!rut || rut.trim() === '') {
    return 'RUT es requerido';
  }
  
  const rutLimpio = rut.trim();
  
  if (rutLimpio.length < LIMITES.RUT.min || rutLimpio.length > LIMITES.RUT.max) {
    return `RUT debe tener entre ${LIMITES.RUT.min} y ${LIMITES.RUT.max} caracteres`;
  }
  
  if (!REGEX.RUT.test(rutLimpio)) {
    return 'Formato de RUT inválido. Use formato: 12345678-9';
  }
  
  return null;
};

/**
 * Valida todos los campos de un formulario de administrador
 * @param {Object} datos - Datos del formulario
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioAdmin = (datos) => {
  const errores = {};
  
  const errorNombre = validarNombre(datos.nombre, 'Nombre');
  if (errorNombre) errores.nombre = errorNombre;
  
  const errorEmail = validarEmail(datos.email);
  if (errorEmail) errores.email = errorEmail;
  
  const errorPassword = validarPassword(datos.password);
  if (errorPassword) errores.password = errorPassword;
  
  return errores;
};

/**
 * Valida todos los campos de un formulario de cliente
 * @param {Object} datos - Datos del formulario
 * @param {boolean} requierePassword - Si se requiere validar contraseña (default: true)
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioCliente = (datos, requierePassword = true) => {
  const errores = {};
  
  const errorNombre = validarNombre(datos.nombre, 'Nombre');
  if (errorNombre) errores.nombre = errorNombre;
  
  const errorEmail = validarEmail(datos.correo);
  if (errorEmail) errores.correo = errorEmail;
  
  // Solo validar contraseña si se requiere (para creación, no para edición)
  if (requierePassword) {
    const errorPassword = validarPassword(datos.password);
    if (errorPassword) errores.password = errorPassword;
  }
  
  const errorPais = validarPais(datos.pais);
  if (errorPais) errores.pais = errorPais;
  
  const errorComuna = validarComuna(datos.comuna);
  if (errorComuna) errores.comuna = errorComuna;
  
  const errorDireccion = validarDireccion(datos.direccion);
  if (errorDireccion) errores.direccion = errorDireccion;
  
  const errorTelefono = validarTelefono(datos.telefono);
  if (errorTelefono) errores.telefono = errorTelefono;
  
  return errores;
};

/**
 * Valida todos los campos de un formulario de empresa
 * @param {Object} datos - Datos del formulario
 * @param {boolean} requierePassword - Si se requiere validar contraseña (default: true)
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioEmpresa = (datos, requierePassword = true) => {
  const errores = {};
  
  const errorNombre = validarNombre(datos.nombre, 'Nombre de empresa');
  if (errorNombre) errores.nombre = errorNombre;
  
  const errorEmail = validarEmail(datos.email);
  if (errorEmail) errores.email = errorEmail;
  
  // Solo validar contraseña si se requiere (para creación, no para edición)
  if (requierePassword) {
    const errorPassword = validarPassword(datos.password);
    if (errorPassword) errores.password = errorPassword;
  }
  
  const errorRut = validarRut(datos.rut);
  if (errorRut) errores.rut = errorRut;
  
  // Para empresas, país no es requerido
  // const errorPais = validarPais(datos.pais);
  // if (errorPais) errores.pais = errorPais;
  
  // Comuna es opcional para empresas
  if (datos.comuna && datos.comuna.trim()) {
    const errorComuna = validarComuna(datos.comuna);
    if (errorComuna) errores.comuna = errorComuna;
  }
  
  // Dirección es opcional para empresas
  if (datos.direccion && datos.direccion.trim()) {
    const errorDireccion = validarDireccion(datos.direccion);
    if (errorDireccion) errores.direccion = errorDireccion;
  }
  
  // Teléfono es opcional para empresas
  if (datos.telefono && datos.telefono.trim()) {
    const errorTelefono = validarTelefono(datos.telefono);
    if (errorTelefono) errores.telefono = errorTelefono;
  }
  
  return errores;
};

/**
 * Función para formatear automáticamente el input mientras se escribe
 * @param {string} valor - Valor actual del input
 * @param {string} tipo - Tipo de validación a aplicar
 * @returns {string} - Valor formateado
 */
export const formatearInput = (valor, tipo) => {
  switch (tipo) {
    case 'telefono':
      return valor.replace(/[^0-9+\-\s()]/g, '');
    case 'nombre':
      return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    case 'numeros':
      return valor.replace(/[^0-9]/g, '');
    case 'email':
      return valor.toLowerCase().trim();
    case 'rut':
      return valor.replace(/[^0-9kK\-]/g, '');
    default:
      return valor;
  }
};

/**
 * Valida email único verificando en todas las colecciones (para uso en tiempo real)
 * @param {string} email - Email a validar
 * @param {Function} verificarEmailCallback - Función callback para verificar email (debe retornar Promise<boolean>)
 * @returns {Promise<string|null>} - Mensaje de error o null si es válido
 */
export const validarEmailUnico = async (email, verificarEmailCallback) => {
  // Primero validar formato
  const errorFormato = validarEmail(email);
  if (errorFormato) {
    return errorFormato;
  }
  
  // Si hay función de verificación, usarla
  if (verificarEmailCallback) {
    try {
      const emailExiste = await verificarEmailCallback(email.trim().toLowerCase());
      if (emailExiste) {
        return 'Este email ya está registrado en el sistema';
      }
    } catch (error) {
      console.error('Error verificando email único:', error);
      // En caso de error, continuar con validación básica
    }
  }
  
  return null;
}; 