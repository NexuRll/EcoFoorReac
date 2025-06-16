// Tipos de usuario en el sistema
export const USER_TYPES = {
  ADMIN: 'admin',
  EMPRESA: 'empresa', 
  CLIENTE: 'cliente',
  USUARIO: 'usuario' // Para compatibilidad
};

// Roles y permisos
export const USER_ROLES = {
  [USER_TYPES.ADMIN]: {
    label: 'Administrador',
    icon: 'fas fa-user-shield',
    permissions: ['*'] // Todos los permisos
  },
  [USER_TYPES.EMPRESA]: {
    label: 'Empresa',
    icon: 'fas fa-building',
    permissions: ['productos.create', 'productos.read', 'productos.update', 'productos.delete', 'perfil.update']
  },
  [USER_TYPES.CLIENTE]: {
    label: 'Cliente', 
    icon: 'fas fa-user',
    permissions: ['productos.read', 'perfil.update', 'pedidos.create']
  }
};

// Rutas por tipo de usuario
export const USER_ROUTES = {
  [USER_TYPES.ADMIN]: '/admin',
  [USER_TYPES.EMPRESA]: '/empresa', 
  [USER_TYPES.CLIENTE]: '/cliente'
};

// Helper functions
export const getUserTypeLabel = (type) => {
  return USER_ROLES[type]?.label || 'Usuario';
};

export const getUserTypeIcon = (type) => {
  return USER_ROLES[type]?.icon || 'fas fa-user';
};

export const hasPermission = (userType, permission) => {
  const permissions = USER_ROLES[userType]?.permissions || [];
  return permissions.includes('*') || permissions.includes(permission);
}; 