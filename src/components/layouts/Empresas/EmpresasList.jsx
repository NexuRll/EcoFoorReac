import React, { useState, useEffect } from 'react';
import { obtenerEmpresas, eliminarEmpresa, buscarEmpresas } from '../../../services/empresas/empresasOperaciones';
import Swal from 'sweetalert2';

/**
 * Componente para mostrar la lista de empresas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onEdit - Función a ejecutar cuando se quiere editar una empresa
 * @param {Function} props.onPasswordChange - Función a ejecutar cuando se quiere cambiar contraseña de una empresa
 */
export default function EmpresasList({ onEdit, onPasswordChange }) {
  // Estado para almacenar la lista de empresas
  const [empresas, setEmpresas] = useState([]);
  
  // Estado para búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Estado para indicar carga
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para mensaje de error
  const [error, setError] = useState(null);
  
  // Cargar empresas al montar el componente
  useEffect(() => {
    cargarEmpresas();
  }, []);
  
  // Función para cargar las empresas
  const cargarEmpresas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const listaEmpresas = await obtenerEmpresas();
      setEmpresas(listaEmpresas);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      setError("No se pudieron cargar las empresas. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para buscar empresas
  const handleBuscar = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultados = await buscarEmpresas(terminoBusqueda);
      setEmpresas(resultados);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setError("Error al realizar la búsqueda. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para eliminar empresa
  const handleEliminar = (id, nombre) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la empresa "${nombre}" y todos sus datos asociados.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarEmpresa(id);
          
          // Actualizar lista después de eliminar
          setEmpresas(prevEmpresas => prevEmpresas.filter(empresa => empresa.id !== id));
          
          Swal.fire(
            'Eliminada',
            'La empresa ha sido eliminada correctamente.',
            'success'
          );
        } catch (error) {
          Swal.fire(
            'Error',
            'No se pudo eliminar la empresa. Inténtelo nuevamente.',
            'error'
          );
        }
      }
    });
  };
  
  // Renderizar mensaje de carga o error
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando empresas...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={cargarEmpresas}
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  return (
    <div className="card shadow">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Empresas</h5>
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o RUT"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={handleBuscar}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {empresas.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-building fa-3x text-muted mb-3"></i>
            <p className="lead">No se encontraron empresas</p>
            {terminoBusqueda && (
              <button 
                className="btn btn-outline-primary mt-2"
                onClick={() => {
                  setTerminoBusqueda('');
                  cargarEmpresas();
                }}
              >
                Ver todas las empresas
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Comuna</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map(empresa => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.rut}</td>
                    <td>{empresa.comuna}</td>
                    <td>{empresa.email}</td>
                    <td>{empresa.telefono}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onEdit && onEdit(empresa.id)}
                          title="Editar empresa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => onPasswordChange && onPasswordChange(empresa.id)}
                          title="Cambiar contraseña"
                        >
                          <i className="fas fa-lock"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
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