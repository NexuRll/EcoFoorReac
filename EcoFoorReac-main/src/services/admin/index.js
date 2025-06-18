/**
 * Archivo principal para exportar todas las funcionalidades de administración
 * Esto facilita la importación de las funciones en otros archivos
 */

// Exportar funciones de administrador principal
export { 
  ADMIN_PRINCIPAL_UID,
  COLECCION_ADMIN,
  esAdminPrincipal,
  obtenerAdminPrincipal,
  existeAdminPrincipal
} from './adminPrincipal';

// Exportar funciones de autenticación de administradores
export {
  verificarCredencialesAdmin
} from './adminAuth';

// Exportar funciones de operaciones CRUD para administradores
export {
  obtenerAdministradores,
  crearAdministrador,
  actualizarAdministrador,
  eliminarAdministrador
} from './adminOperaciones';

// Exportar funciones de operaciones CRUD para usuarios
export {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} from './usuariosOperaciones'; 