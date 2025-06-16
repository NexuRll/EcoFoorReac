import React from 'react';
import LoadingSpinner from '../../common/ui/LoadingSpinner';
import EmptyState from '../../common/ui/EmptyState';

const UsuariosList = ({ 
  usuarios, 
  loading, 
  onEditar, 
  onEliminar, 
  onCambiarPassword,
  onNuevoUsuario 
}) => {
  if (loading) {
    return <LoadingSpinner text="Cargando usuarios..." />;
  }

  if (usuarios.length === 0) {
    return (
      <EmptyState
        icon="fas fa-users"
        title="No hay clientes registrados"
        message="Comienza agregando el primer cliente al sistema."
        actionButton={
          <button 
            className="btn btn-primary"
            onClick={onNuevoUsuario}
          >
            <i className="fas fa-plus me-2"></i>
            Agregar Primer Cliente
          </button>
        }
      />
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-users me-2"></i>
          Gestión de Clientes ({usuarios.length})
        </h5>
        <button 
          className="btn btn-primary"
          onClick={onNuevoUsuario}
        >
          <i className="fas fa-plus me-2"></i>
          Nuevo Cliente
        </button>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Ubicación</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{usuario.nombre}</h6>
                        <small className="text-muted">ID: {usuario.id.substring(0, 8)}...</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-break">{usuario.correo}</span>
                  </td>
                  <td>
                    <div>
                      <i className="fas fa-map-marker-alt text-muted me-1"></i>
                      {usuario.comuna && usuario.pais ? (
                        <>
                          <span>{usuario.comuna}</span>
                          <br />
                          <small className="text-muted">{usuario.pais}</small>
                        </>
                      ) : (
                        <span className="text-muted">No especificado</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {usuario.telefono ? (
                      <span>
                        <i className="fas fa-phone text-muted me-1"></i>
                        {usuario.telefono}
                      </span>
                    ) : (
                      <span className="text-muted">No especificado</span>
                    )}
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
                        onClick={() => onEditar(usuario.id)}
                        title="Editar cliente"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => onCambiarPassword(usuario.id)}
                        title="Cambiar contraseña"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onEliminar(usuario)}
                        title="Eliminar cliente"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card-footer text-muted">
        <small>
          <i className="fas fa-info-circle me-1"></i>
          Total de clientes registrados: {usuarios.length}
        </small>
      </div>
    </div>
  );
};

export default UsuariosList; 