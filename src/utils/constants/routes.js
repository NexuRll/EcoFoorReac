// Rutas públicas
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECOVERY: '/recuperar-contrasena'
};

// Rutas de administrador
export const ADMIN_ROUTES = {
  BASE: '/admin',
  DASHBOARD: '/admin/dashboard',
  EMPRESAS: '/admin/empresas',
  CLIENTES: '/admin/clientes', 
  USUARIOS: '/admin/clientes', // Alias para clientes
  ADMINISTRADORES: '/admin/administradores',
  CONFIG: '/admin/administradores' // Alias para config
};

// Rutas de empresa
export const EMPRESA_ROUTES = {
  BASE: '/empresa',
  DASHBOARD: '/empresa/dashboard', 
  PERFIL: '/empresa/perfil',
  PRODUCTOS: '/empresa/productos'
};

// Rutas de cliente
export const CLIENTE_ROUTES = {
  BASE: '/cliente',
  DASHBOARD: '/cliente/dashboard',
  PERFIL: '/cliente/perfil',
  CATALOGO: '/catalogo',
  PEDIDOS: '/cliente/pedidos'
};

// Rutas comunes autenticadas
export const AUTH_ROUTES = {
  PERFIL: '/perfil',
  HOME_AUTH: '/catalogo'
};

// Helper para construir rutas dinámicas
export const buildRoute = (base, ...segments) => {
  return [base, ...segments].join('/').replace(/\/+/g, '/');
};

// Verificar si una ruta pertenece a un módulo específico
export const isAdminRoute = (path) => path.startsWith(ADMIN_ROUTES.BASE);
export const isEmpresaRoute = (path) => path.startsWith(EMPRESA_ROUTES.BASE);
export const isClienteRoute = (path) => path.startsWith(CLIENTE_ROUTES.BASE); 