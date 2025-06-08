/**
 * Archivo índice para exportar todas las funciones relacionadas con empresas
 */

// Exportar operaciones de empresas
export {
  obtenerEmpresas,
  obtenerEmpresaPorId,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
  buscarEmpresas
} from './empresasOperaciones';

// Exportar validaciones de empresas
export {
  validarEmpresa,
  validarFormatoRut,
  validarEmail,
  validarTelefono
} from './empresasValidaciones'; 