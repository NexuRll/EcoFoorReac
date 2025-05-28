/**
 * Este archivo es un wrapper para mantener la compatibilidad con el código existente
 * Redirige todas las llamadas a los nuevos archivos modularizados
 */

import { 
  verificarCredencialesAdmin as verifyAdmin,
  obtenerAdministradores,
  obtenerUsuarios,
  eliminarUsuario,
  eliminarAdministrador,
  crearAdministrador,
  actualizarAdministrador,
  actualizarUsuario,
  esAdminPrincipal
} from './admin';

// Exportar la función original para mantener compatibilidad
export const verificarCredencialesAdmin = verifyAdmin;

// Exportar todas las funciones desde los nuevos módulos
export {
  obtenerAdministradores,
  obtenerUsuarios,
  eliminarUsuario,
  eliminarAdministrador,
  crearAdministrador,
  actualizarAdministrador,
  actualizarUsuario,
  esAdminPrincipal
};
