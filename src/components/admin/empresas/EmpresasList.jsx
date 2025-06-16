import React from 'react';

const EmpresasList = ({ 
  empresas, 
  loading, 
  onEditar, 
  onEliminar, 
  onCambiarEstado, 
  onCambiarPassword,
  onNuevaEmpresa 
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando empresas...</span>
        </div>
        <p className="mt-3">Cargando empresas...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-building me-2"></i>
          Gestión de Empresas ({empresas.length})
        </h5>
        <button 
          className="btn btn-light btn-sm"
          onClick={onNuevaEmpresa}
        >
          <i className="fas fa-plus me-1"></i>
          Nueva Empresa
        </button>
      </div>
      
      <div className="card-body">
        {empresas.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-building fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No hay empresas registradas</h5>
            <p className="text-muted">Haz clic en "Nueva Empresa" para agregar la primera empresa.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Empresa</th>
                  <th>Email</th>
                  <th>RUT</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>
                      <div>
                        <strong>{empresa.nombre}</strong>
                        {empresa.direccion && (
                          <small className="d-block text-muted">
                            {empresa.direccion}
                            {empresa.comuna && `, ${empresa.comuna}`}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-break">{empresa.email}</span>
                      {empresa.emailVerified && (
                        <i className="fas fa-check-circle text-success ms-1" title="Email verificado"></i>
                      )}
                    </td>
                    <td>
                      <code>{empresa.rut}</code>
                    </td>
                    <td>
                      {empresa.telefono || (
                        <span className="text-muted">No especificado</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${empresa.activa ? 'bg-success' : 'bg-danger'}`}>
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      {empresa.fechaRegistro ? (
                        new Date(empresa.fechaRegistro.seconds * 1000).toLocaleDateString('es-ES')
                      ) : (
                        <span className="text-muted">No disponible</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onEditar(empresa.id)}
                          title="Editar empresa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        
                        <button
                          className="btn btn-outline-warning"
                          onClick={() => onCambiarPassword(empresa)}
                          title="Cambiar contraseña"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        
                        <button
                          className={`btn ${empresa.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => onCambiarEstado(empresa.id, !empresa.activa)}
                          title={empresa.activa ? 'Desactivar empresa' : 'Activar empresa'}
                        >
                          <i className={`fas ${empresa.activa ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => onEliminar(empresa)}
                          title="Eliminar empresa"
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
        )}
      </div>
    </div>
  );
};

export default EmpresasList; 