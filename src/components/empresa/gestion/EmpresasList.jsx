import React, { useState, useEffect } from 'react';
import { obtenerTodasLasEmpresas, eliminarEmpresaConAuth } from '../../../services/empresas/empresasOperaciones';
import Swal from 'sweetalert2';

/**
 * Componente para mostrar la lista de empresas registradas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onEdit - Función para editar una empresa
 * @param {Function} props.onRefresh - Función para refrescar la lista
 */
export default function EmpresasList({ onEdit, onRefresh }) {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  // Cargar empresas al montar el componente
  useEffect(() => {
    cargarEmpresas();
  }, []);

  // Función para cargar todas las empresas
  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const empresasData = await obtenerTodasLasEmpresas();
      setEmpresas(empresasData);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las empresas'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una empresa
  const handleEliminar = async (empresaId, nombreEmpresa) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Esta acción eliminará permanentemente la empresa:</p>
        <p><strong>${nombreEmpresa}</strong></p>
        <p class="text-danger">Esta acción no se puede deshacer.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarEmpresaConAuth(empresaId);
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La empresa ha sido eliminada correctamente',
          timer: 2000
        });
        
        // Refrescar la lista
        await cargarEmpresas();
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar la empresa'
        });
      }
    }
  };

  // Filtrar empresas según el texto de búsqueda
  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    empresa.email.toLowerCase().includes(filtro.toLowerCase()) ||
    empresa.rut.includes(filtro)
  );

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando empresas...</span>
        </div>
        <p className="mt-2">Cargando empresas...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-building me-2"></i>
            Lista de Empresas ({empresas.length})
          </h5>
          <button
            className="btn btn-light btn-sm"
            onClick={cargarEmpresas}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Actualizar
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Barra de búsqueda */}
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, email o RUT..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista de empresas */}
        {empresasFiltradas.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-building text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-2">
              {filtro ? 'No se encontraron empresas que coincidan con la búsqueda' : 'No hay empresas registradas'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Empresa</th>
                  <th>RUT</th>
                  <th>Email</th>
                  <th>Ubicación</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                             style={{ width: '40px', height: '40px' }}>
                          <i className="fas fa-building text-success"></i>
                        </div>
                        <div>
                          <div className="fw-bold">{empresa.nombre}</div>
                          <small className="text-muted">ID: {empresa.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{empresa.rut}</span>
                    </td>
                    <td>{empresa.email}</td>
                    <td>
                      <div>
                        <div>{empresa.comuna}, {empresa.pais}</div>
                        <small className="text-muted">{empresa.direccion}</small>
                      </div>
                    </td>
                    <td>{empresa.telefono || 'No especificado'}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onEdit(empresa.id)}
                          title="Editar empresa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleEliminar(empresa.id, empresa.nombre)}
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
} 