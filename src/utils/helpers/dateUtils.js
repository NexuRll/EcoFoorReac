/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha a string legible en español
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'No especificada';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatea una fecha con hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return 'No especificada';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene una fecha relativa (hace X días, etc.)
 * @param {Date|string} date - Fecha a comparar
 * @returns {string} Fecha relativa
 */
export const getRelativeDate = (date) => {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInDays > 7) {
    return formatDate(dateObj);
  } else if (diffInDays > 0) {
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInMinutes > 0) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else {
    return 'Hace un momento';
  }
};

/**
 * Verifica si una fecha está próxima a vencer
 * @param {Date|string} date - Fecha a verificar
 * @param {number} days - Días de anticipación (default: 3)
 * @returns {boolean} True si está próxima a vencer
 */
export const isNearExpiration = (date, days = 3) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = dateObj - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays <= days && diffInDays >= 0;
};

/**
 * Verifica si una fecha ya venció
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si ya venció
 */
export const isExpired = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj < now;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha actual
 */
export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha de mañana en formato YYYY-MM-DD
 * @returns {string} Fecha de mañana
 */
export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Calcula los días entre dos fechas
 * @param {Date|string} startDate - Fecha inicial
 * @param {Date|string} endDate - Fecha final
 * @returns {number} Número de días
 */
export const daysBetween = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffInMs = end - start;
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * Valida si una fecha es válida
 * @param {Date|string} date - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

/**
 * Convierte una fecha a formato ISO string
 * @param {Date|string} date - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISOString = (date) => {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return null;
  
  return dateObj.toISOString();
}; 