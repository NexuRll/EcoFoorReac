/**
 * Validaciones para los datos de empresas
 */

/**
 * Valida que el RUT tenga el formato correcto (XX.XXX.XXX-X)
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si el RUT es válido
 */
export const validarFormatoRut = (rut) => {
  if (!rut) return false;
  
  // Eliminar puntos y guión
  const rutLimpio = rut.replace(/\./g, '').replace('-', '');
  
  // Validar largo
  if (rutLimpio.length < 7 || rutLimpio.length > 9) {
    return false;
  }
  
  // Validar que termine en número o K
  const digitoVerificador = rutLimpio.charAt(rutLimpio.length - 1).toUpperCase();
  if (!/^[0-9K]$/.test(digitoVerificador)) {
    return false;
  }
  
  // Validar que el resto sean números
  const rutNumerico = rutLimpio.slice(0, -1);
  if (!/^\d+$/.test(rutNumerico)) {
    return false;
  }
  
  return true;
};

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
export const validarEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida el formato de teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si el teléfono es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return false;
  
  // Eliminar espacios, paréntesis y guiones
  const telefonoLimpio = telefono.replace(/[\s\(\)\-]/g, '');
  
  // Validar que tenga 9 dígitos (formato chileno estándar)
  if (telefonoLimpio.length !== 9) {
    return false;
  }
  
  // Validar que todos sean números
  return /^\d+$/.test(telefonoLimpio);
};

/**
 * Valida todos los campos de una empresa
 * @param {Object} empresaData - Datos de la empresa a validar
 * @returns {Object} Objeto con errores encontrados o vacío si todo es válido
 */
export const validarEmpresa = (empresaData) => {
  const errores = {};
  
  // Validar nombre
  if (!empresaData.nombre || empresaData.nombre.trim() === '') {
    errores.nombre = "El nombre es obligatorio";
  } else if (empresaData.nombre.length < 3) {
    errores.nombre = "El nombre debe tener al menos 3 caracteres";
  }
  
  // Validar RUT
  if (!empresaData.rut || empresaData.rut.trim() === '') {
    errores.rut = "El RUT es obligatorio";
  } else if (!validarFormatoRut(empresaData.rut)) {
    errores.rut = "El formato del RUT no es válido";
  }
  
  // Validar dirección
  if (!empresaData.direccion || empresaData.direccion.trim() === '') {
    errores.direccion = "La dirección es obligatoria";
  }
  
  // Validar comuna
  if (!empresaData.comuna || empresaData.comuna.trim() === '') {
    errores.comuna = "La comuna es obligatoria";
  }
  
  // Validar email
  if (!empresaData.email || empresaData.email.trim() === '') {
    errores.email = "El email es obligatorio";
  } else if (!validarEmail(empresaData.email)) {
    errores.email = "El formato del email no es válido";
  }
  
  // Validar teléfono
  if (!empresaData.telefono || empresaData.telefono.trim() === '') {
    errores.telefono = "El teléfono es obligatorio";
  } else if (!validarTelefono(empresaData.telefono)) {
    errores.telefono = "El formato del teléfono no es válido";
  }
  
  return errores;
}; 