/**
 * Reglas de validación para productos según requerimientos
 */

// Límites para campos de productos
export const PRODUCT_LIMITS = {
  NOMBRE: {
    min: 3,
    max: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-.,()]+$/
  },
  DESCRIPCION: {
    min: 10,
    max: 500
  },
  CANTIDAD: {
    min: 0,
    max: 10000
  },
  PRECIO: {
    min: 0,
    max: 1000000
  }
};

// Estados de productos
export const PRODUCT_STATUS = {
  DISPONIBLE: 'disponible',
  POR_VENCER: 'por_vencer',
  VENCIDO: 'vencido',
  AGOTADO: 'agotado'
};

// Etiquetas de estado con colores
export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.DISPONIBLE]: {
    label: 'Disponible',
    color: 'success',
    icon: 'fa-check-circle'
  },
  [PRODUCT_STATUS.POR_VENCER]: {
    label: 'Por Vencer',
    color: 'warning',
    icon: 'fa-exclamation-triangle'
  },
  [PRODUCT_STATUS.VENCIDO]: {
    label: 'Vencido',
    color: 'danger',
    icon: 'fa-times-circle'
  },
  [PRODUCT_STATUS.AGOTADO]: {
    label: 'Agotado',
    color: 'secondary',
    icon: 'fa-ban'
  }
};

// Opciones para filtros
export const FILTER_OPTIONS = {
  STATUS: [
    { value: '', label: 'Todos los estados' },
    { value: PRODUCT_STATUS.DISPONIBLE, label: 'Disponibles' },
    { value: PRODUCT_STATUS.POR_VENCER, label: 'Por vencer' },
    { value: PRODUCT_STATUS.VENCIDO, label: 'Vencidos' },
    { value: PRODUCT_STATUS.AGOTADO, label: 'Agotados' }
  ],
  SORT_BY: [
    { value: 'nombre_asc', label: 'Nombre (A-Z)' },
    { value: 'nombre_desc', label: 'Nombre (Z-A)' },
    { value: 'precio_asc', label: 'Precio (Menor a Mayor)' },
    { value: 'precio_desc', label: 'Precio (Mayor a Menor)' },
    { value: 'fecha_asc', label: 'Fecha (Más Antiguo)' },
    { value: 'fecha_desc', label: 'Fecha (Más Reciente)' },
    { value: 'vencimiento_asc', label: 'Vencimiento (Próximo)' },
    { value: 'vencimiento_desc', label: 'Vencimiento (Lejano)' }
  ],
  ITEMS_PER_PAGE: [
    { value: 5, label: '5 productos' },
    { value: 10, label: '10 productos' },
    { value: 20, label: '20 productos' }
  ]
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  NOMBRE: {
    REQUIRED: 'El nombre del producto es obligatorio',
    MIN_LENGTH: `El nombre debe tener al menos ${PRODUCT_LIMITS.NOMBRE.min} caracteres`,
    MAX_LENGTH: `El nombre no puede exceder ${PRODUCT_LIMITS.NOMBRE.max} caracteres`,
    INVALID_CHARS: 'El nombre contiene caracteres no válidos'
  },
  DESCRIPCION: {
    REQUIRED: 'La descripción es obligatoria',
    MIN_LENGTH: `La descripción debe tener al menos ${PRODUCT_LIMITS.DESCRIPCION.min} caracteres`,
    MAX_LENGTH: `La descripción no puede exceder ${PRODUCT_LIMITS.DESCRIPCION.max} caracteres`
  },
  VENCIMIENTO: {
    REQUIRED: 'La fecha de vencimiento es obligatoria',
    INVALID_DATE: 'La fecha de vencimiento no es válida',
    PAST_DATE: 'La fecha de vencimiento no puede ser anterior a hoy',
    TOO_FAR: 'La fecha de vencimiento no puede ser mayor a 5 años'
  },
  CANTIDAD: {
    REQUIRED: 'La cantidad es obligatoria',
    MIN_VALUE: `La cantidad debe ser mayor o igual a ${PRODUCT_LIMITS.CANTIDAD.min}`,
    MAX_VALUE: `La cantidad no puede exceder ${PRODUCT_LIMITS.CANTIDAD.max}`,
    INVALID_NUMBER: 'La cantidad debe ser un número válido'
  },
  PRECIO: {
    MIN_VALUE: `El precio debe ser mayor o igual a ${PRODUCT_LIMITS.PRECIO.min}`,
    MAX_VALUE: `El precio no puede exceder ${PRODUCT_LIMITS.PRECIO.max}`,
    INVALID_NUMBER: 'El precio debe ser un número válido'
  }
};

// Configuración de alertas
export const ALERT_CONFIG = {
  EXPIRATION_WARNING_DAYS: 3, // Días antes del vencimiento para mostrar advertencia
  SUCCESS_TIMEOUT: 2000, // Tiempo en ms para alertas de éxito
  ERROR_TIMEOUT: 5000 // Tiempo en ms para alertas de error
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  SHOW_SIZE_SELECTOR: true,
  SHOW_QUICK_JUMPER: true
};

// Patrones de validación
export const VALIDATION_PATTERNS = {
  PRODUCT_NAME: PRODUCT_LIMITS.NOMBRE.pattern,
  POSITIVE_NUMBER: /^\d+(\.\d{1,2})?$/,
  PRICE: /^\d+(\.\d{1,2})?$/
};

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // ms
  SEARCH_FIELDS: ['nombre', 'descripcion']
};

// Tipos de productos (para futuras extensiones)
export const PRODUCT_TYPES = {
  ALIMENTO: 'alimento',
  BEBIDA: 'bebida',
  CONSERVA: 'conserva',
  FRESCO: 'fresco',
  CONGELADO: 'congelado'
};

// Unidades de medida
export const MEASUREMENT_UNITS = {
  UNIDAD: 'unidad',
  KILOGRAMO: 'kg',
  GRAMO: 'g',
  LITRO: 'l',
  MILILITRO: 'ml',
  PAQUETE: 'paquete',
  CAJA: 'caja'
}; 