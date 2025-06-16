// Servicio para validaciones de unicidad en tiempo real

import { db } from '../core/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Verifica si un email ya está registrado en el sistema
 * @param {string} email - Email a verificar
 * @param {string} excluirId - ID a excluir de la búsqueda (para ediciones)
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export const verificarEmailUnico = async (email, excluirId = null) => {
  try {
    if (!email || email.trim() === '') {
      return { esUnico: true, mensaje: null };
    }

    const emailLimpio = email.trim().toLowerCase();
    const colecciones = [
      { nombre: 'usuarios', campoEmail: 'correo', tipo: 'cliente' },
      { nombre: 'empresas', campoEmail: 'email', tipo: 'empresa' },
      { nombre: 'Administrador', campoEmail: 'Correo', tipo: 'administrador' }
    ];

    for (const coleccion of colecciones) {
      const ref = collection(db, coleccion.nombre);
      const emailQuery = query(ref, where(coleccion.campoEmail, '==', emailLimpio));
      const snapshot = await getDocs(emailQuery);

      if (!snapshot.empty) {
        // Si estamos editando, verificar que no sea el mismo registro
        if (excluirId) {
          const esElMismo = snapshot.docs.some(doc => doc.id === excluirId);
          if (esElMismo && snapshot.docs.length === 1) {
            continue; // Es el mismo registro, continuar buscando
          }
        }

        return {
          esUnico: false,
          mensaje: `Este email ya está registrado como ${coleccion.tipo}`,
          tipo: coleccion.tipo,
          encontradoEn: coleccion.nombre
        };
      }
    }

    return { esUnico: true, mensaje: 'Email disponible' };
  } catch (error) {
    console.error('Error verificando email único:', error);
    return { 
      esUnico: true, 
      mensaje: 'No se pudo verificar el email',
      error: true 
    };
  }
};

/**
 * Verifica si un RUT ya está registrado en el sistema (solo empresas)
 * @param {string} rut - RUT a verificar
 * @param {string} excluirId - ID a excluir de la búsqueda (para ediciones)
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export const verificarRutUnico = async (rut, excluirId = null) => {
  try {
    if (!rut || rut.trim() === '') {
      return { esUnico: true, mensaje: null };
    }

    const rutLimpio = rut.trim();
    const empresasRef = collection(db, 'empresas');
    const rutQuery = query(empresasRef, where('rut', '==', rutLimpio));
    const snapshot = await getDocs(rutQuery);

    if (!snapshot.empty) {
      // Si estamos editando, verificar que no sea el mismo registro
      if (excluirId) {
        const esElMismo = snapshot.docs.some(doc => doc.id === excluirId);
        if (esElMismo && snapshot.docs.length === 1) {
          return { esUnico: true, mensaje: 'RUT disponible (mismo registro)' };
        }
      }

      return {
        esUnico: false,
        mensaje: 'Ya existe una empresa registrada con este RUT',
        tipo: 'empresa',
        encontradoEn: 'empresas'
      };
    }

    return { esUnico: true, mensaje: 'RUT disponible' };
  } catch (error) {
    console.error('Error verificando RUT único:', error);
    return { 
      esUnico: true, 
      mensaje: 'No se pudo verificar el RUT',
      error: true 
    };
  }
};

/**
 * Debounce para evitar múltiples llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function} - Función con debounce
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Cache para resultados de validación
 */
const cacheValidaciones = new Map();

/**
 * Obtiene resultado desde cache o ejecuta validación
 * @param {string} clave - Clave de cache
 * @param {Function} validacionFunc - Función de validación
 * @param {number} tiempoExpiracion - Tiempo de expiración en ms (default: 30 segundos)
 * @returns {Promise} - Resultado de validación
 */
export const validarConCache = async (clave, validacionFunc, tiempoExpiracion = 30000) => {
  const ahora = Date.now();
  
  // Verificar si hay resultado en cache y no ha expirado
  if (cacheValidaciones.has(clave)) {
    const { resultado, timestamp } = cacheValidaciones.get(clave);
    if (ahora - timestamp < tiempoExpiracion) {
      return resultado;
    }
  }

  // Ejecutar validación y guardar en cache
  const resultado = await validacionFunc();
  cacheValidaciones.set(clave, {
    resultado,
    timestamp: ahora
  });

  return resultado;
};

/**
 * Limpia el cache de validaciones
 */
export const limpiarCacheValidaciones = () => {
  cacheValidaciones.clear();
};

/**
 * Validar email único con debounce (para usar en componentes)
 * @param {string} email - Email a validar  
 * @param {string} excluirId - ID a excluir
 * @param {Function} callback - Función callback con resultado
 * @param {number} delay - Delay para debounce (default: 800ms)
 */
export const validarEmailUnicoConDebounce = (email, excluirId = null, callback, delay = 800) => {
  const validarEmail = debounce(async (emailValue) => {
    if (!emailValue || emailValue.length < 5) {
      callback({ validando: false, esUnico: null, mensaje: null, error: null });
      return;
    }

    callback({ validando: true, esUnico: null, mensaje: 'Verificando email...', error: null });

    const clave = `email_${emailValue}_${excluirId || 'nuevo'}`;
    const resultado = await validarConCache(
      clave,
      () => verificarEmailUnico(emailValue, excluirId)
    );

    callback({
      validando: false,
      esUnico: resultado.esUnico,
      mensaje: resultado.mensaje,
      error: resultado.error || null
    });
  }, delay);

  validarEmail(email);
};

/**
 * Validar RUT único con debounce (para usar en componentes)
 * @param {string} rut - RUT a validar
 * @param {string} excluirId - ID a excluir
 * @param {Function} callback - Función callback con resultado
 * @param {number} delay - Delay para debounce (default: 800ms)
 */
export const validarRutUnicoConDebounce = (rut, excluirId = null, callback, delay = 800) => {
  const validarRut = debounce(async (rutValue) => {
    if (!rutValue || rutValue.length < 9) {
      callback({ validando: false, esUnico: null, mensaje: null, error: null });
      return;
    }

    callback({ validando: true, esUnico: null, mensaje: 'Verificando RUT...', error: null });

    const clave = `rut_${rutValue}_${excluirId || 'nuevo'}`;
    const resultado = await validarConCache(
      clave,
      () => verificarRutUnico(rutValue, excluirId)
    );

    callback({
      validando: false,
      esUnico: resultado.esUnico,
      mensaje: resultado.mensaje,
      error: resultado.error || null
    });
  }, delay);

  validarRut(rut);
}; 