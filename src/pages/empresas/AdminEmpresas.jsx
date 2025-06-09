import React, { useState } from 'react';
import EmpresasList from '../../components/layouts/Empresas/EmpresasList';
import EmpresaForm from '../../components/layouts/Empresas/EmpresaForm';
import CambiarPasswordEmpresa from '../../components/layouts/Empresas/CambiarPasswordEmpresa';

/**
 * Página para administrar empresas (CRUD)
 */
export default function AdminEmpresas() {
  // Estado para controlar la vista actual
  const [vista, setVista] = useState('lista'); // 'lista', 'crear', 'editar', 'cambiarPassword'
  
  // Estado para almacenar el ID de la empresa en edición
  const [empresaId, setEmpresaId] = useState(null);
  
  // Función para cambiar a la vista de creación de empresa
  const handleCrearEmpresa = () => {
    setEmpresaId(null);
    setVista('crear');
  };
  
  // Función para cambiar a la vista de edición de empresa
  const handleEditarEmpresa = (id) => {
    setEmpresaId(id);
    setVista('editar');
  };

  // Función para cambiar a la vista de cambio de contraseña
  const handleCambiarPassword = (id) => {
    setEmpresaId(id);
    setVista('cambiarPassword');
  };
  
  // Función para volver a la lista después de guardar o cancelar
  const handleVolverALista = () => {
    setVista('lista');
    setEmpresaId(null);
  };
  
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {vista === 'lista' && 'Gestión de Empresas'}
          {vista === 'crear' && 'Crear Nueva Empresa'}
          {vista === 'editar' && 'Editar Empresa'}
          {vista === 'cambiarPassword' && 'Cambiar Contraseña'}
        </h2>
        
        {vista === 'lista' ? (
          <button
            className="btn btn-primary"
            onClick={handleCrearEmpresa}
          >
            <i className="fas fa-plus me-2"></i>
            Nueva Empresa
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            onClick={handleVolverALista}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Volver a la lista
          </button>
        )}
      </div>
      
      {vista === 'lista' && (
        <EmpresasList 
          onEdit={handleEditarEmpresa}
          onPasswordChange={handleCambiarPassword}
        />
      )}
      
      {(vista === 'crear' || vista === 'editar') && (
        <EmpresaForm 
          empresaId={empresaId}
          onSave={handleVolverALista}
          onCancel={handleVolverALista}
        />
      )}
      
      {vista === 'cambiarPassword' && (
        <CambiarPasswordEmpresa 
          empresaId={empresaId}
          onSave={handleVolverALista}
          onCancel={handleVolverALista}
        />
      )}
    </div>
  );
} 