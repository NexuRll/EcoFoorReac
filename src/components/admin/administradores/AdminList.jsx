import React from 'react';
import LoadingSpinner from '../../common/ui/LoadingSpinner';
import EmptyState from '../../common/ui/EmptyState';
import { ADMIN_PRINCIPAL_UID } from '../../../services/admin/adminPrincipal';

const AdminList = ({ 
  administradores, 
  loading, 
  onNuevo, 
  onEditar, 
  onEliminar, 
  onCambiarPassword 
}) => {
  if (loading) {
    return <LoadingSpinner text="Cargando administradores..." />;
  }

  if (administradores.length === 0) {
    return (
      <EmptyState
        icon="fas fa-user-shield"
        title="No hay administradores adicionales"
        message="Puedes agregar más administradores para gestionar el sistema."
        actionButton={
          <button 
            className="btn btn-primary"
            onClick={onNuevo}
          >
            <i className="fas fa-plus me-2"></i>
            Agregar Administrador
          </button>
        }
      />
    );
  }

  // Función para verificar si es el administrador principal
  const esAdminPrincipal = (adminId) => {
    return adminId === ADMIN_PRINCIPAL_UID;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-user-shield me-2"></i>
          Administradores del Sistema ({administradores.length})
        </h5>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Administrador</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {administradores.map((admin) => {
                const esPrincipal = esAdminPrincipal(admin.id);
                
                return (
                  <tr key={admin.id} className={esPrincipal ? 'table-warning' : ''}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className={`avatar-sm ${esPrincipal ? 'bg-warning' : 'bg-danger'} text-white rounded-circle d-flex align-items-center justify-content-center me-3`}>
                          <i className={`fas ${esPrincipal ? 'fa-crown' : 'fa-user-shield'}`}></i>
                        </div>
                        <div>
                          <h6 className="mb-0">
                            {admin.Nombre || admin.nombre}
                            {esPrincipal && (
                              <span className="badge bg-warning text-dark ms-2">
                                <i className="fas fa-crown me-1"></i>
                                Principal
                              </span>
                            )}
                          </h6>
                          <small className="text-muted">ID: {admin.id.substring(0, 8)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-break">{admin.Correo || admin.email}</span>
                    </td>
                    <td>
                      <span className={`badge ${esPrincipal ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        <i className={`fas ${esPrincipal ? 'fa-crown' : 'fa-user-shield'} me-1`}></i>
                        {esPrincipal ? 'Administrador Principal' : (admin.Rol || admin.rol || 'Administrador')}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Activo
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onEditar(admin)}
                          title="Editar administrador"
                          disabled={esPrincipal}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => onCambiarPassword(admin.id)}
                          title="Cambiar contraseña"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        {!esPrincipal ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onEliminar(admin.id, admin.Nombre || admin.nombre)}
                            title="Eliminar administrador"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled
                            title="El administrador principal no puede ser eliminado"
                          >
                            <i className="fas fa-shield-alt"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card-footer text-muted">
        <small>
          <i className="fas fa-info-circle me-1"></i>
          Total de administradores: {administradores.length}
          {administradores.some(admin => esAdminPrincipal(admin.id)) && (
            <span className="ms-3">
              <i className="fas fa-crown text-warning me-1"></i>
              El administrador principal está protegido contra eliminación
            </span>
          )}
        </small>
      </div>
    </div>
  );
};

export default AdminList; 