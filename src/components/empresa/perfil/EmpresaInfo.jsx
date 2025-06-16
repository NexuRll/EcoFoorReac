import React from 'react';

const EmpresaInfo = ({ empresa, isEditing = false }) => {
  if (!empresa) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fas fa-building fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No hay información de empresa disponible</h5>
          <p className="text-muted">Complete su perfil para mostrar la información aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-building me-2"></i>
          Información de la Empresa
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          {/* Información básica */}
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">Nombre de la Empresa</label>
            <div className="form-control-plaintext">
              <strong>{empresa.nombre || 'No especificado'}</strong>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">RUT</label>
            <div className="form-control-plaintext">
              <code>{empresa.rut || 'No especificado'}</code>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">Email</label>
            <div className="form-control-plaintext">
              <i className="fas fa-envelope me-2 text-muted"></i>
              {empresa.email || 'No especificado'}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">Teléfono</label>
            <div className="form-control-plaintext">
              <i className="fas fa-phone me-2 text-muted"></i>
              {empresa.telefono || 'No especificado'}
            </div>
          </div>

          {/* Ubicación */}
          <div className="col-12 mb-3">
            <label className="form-label text-muted">Dirección</label>
            <div className="form-control-plaintext">
              <i className="fas fa-map-marker-alt me-2 text-muted"></i>
              {empresa.direccion || 'No especificada'}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">País</label>
            <div className="form-control-plaintext">
              <i className="fas fa-flag me-2 text-muted"></i>
              {empresa.pais || 'No especificado'}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">Comuna</label>
            <div className="form-control-plaintext">
              <i className="fas fa-map me-2 text-muted"></i>
              {empresa.comuna || 'No especificada'}
            </div>
          </div>

          {/* Descripción */}
          {empresa.descripcion && (
            <div className="col-12 mb-3">
              <label className="form-label text-muted">Descripción</label>
              <div className="form-control-plaintext">
                <p className="mb-0">{empresa.descripcion}</p>
              </div>
            </div>
          )}

          {/* Estado y fechas */}
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted">Estado</label>
            <div className="form-control-plaintext">
              <span className={`badge ${
                empresa.estado === 'activo' ? 'bg-success' : 
                empresa.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'
              }`}>
                <i className={`fas ${
                  empresa.estado === 'activo' ? 'fa-check-circle' : 
                  empresa.estado === 'pendiente' ? 'fa-clock' : 'fa-times-circle'
                } me-1`}></i>
                {empresa.estado ? empresa.estado.charAt(0).toUpperCase() + empresa.estado.slice(1) : 'No especificado'}
              </span>
            </div>
          </div>

          {empresa.fechaRegistro && (
            <div className="col-md-6 mb-3">
              <label className="form-label text-muted">Fecha de Registro</label>
              <div className="form-control-plaintext">
                <i className="fas fa-calendar me-2 text-muted"></i>
                {new Date(empresa.fechaRegistro).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {(empresa.sitioWeb || empresa.redesSociales) && (
          <>
            <hr />
            <div className="row">
              {empresa.sitioWeb && (
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Sitio Web</label>
                  <div className="form-control-plaintext">
                    <a 
                      href={empresa.sitioWeb} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      <i className="fas fa-globe me-2"></i>
                      {empresa.sitioWeb}
                    </a>
                  </div>
                </div>
              )}

              {empresa.redesSociales && (
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Redes Sociales</label>
                  <div className="form-control-plaintext">
                    <div className="d-flex gap-2">
                      {empresa.redesSociales.facebook && (
                        <a 
                          href={empresa.redesSociales.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="fab fa-facebook"></i>
                        </a>
                      )}
                      {empresa.redesSociales.instagram && (
                        <a 
                          href={empresa.redesSociales.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="fab fa-instagram"></i>
                        </a>
                      )}
                      {empresa.redesSociales.twitter && (
                        <a 
                          href={empresa.redesSociales.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-info btn-sm"
                        >
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Estadísticas rápidas */}
        <hr />
        <div className="row text-center">
          <div className="col-md-3">
            <div className="stat-item">
              <i className="fas fa-box fa-2x text-success mb-2"></i>
              <h6 className="mb-0">{empresa.totalProductos || 0}</h6>
              <small className="text-muted">Productos</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <i className="fas fa-eye fa-2x text-info mb-2"></i>
              <h6 className="mb-0">{empresa.visualizaciones || 0}</h6>
              <small className="text-muted">Visualizaciones</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <i className="fas fa-star fa-2x text-warning mb-2"></i>
              <h6 className="mb-0">{empresa.calificacion || 'N/A'}</h6>
              <small className="text-muted">Calificación</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <i className="fas fa-calendar fa-2x text-primary mb-2"></i>
              <h6 className="mb-0">
                {empresa.fechaRegistro ? 
                  Math.floor((new Date() - new Date(empresa.fechaRegistro)) / (1000 * 60 * 60 * 24)) 
                  : 0
                }
              </h6>
              <small className="text-muted">Días activo</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaInfo; 