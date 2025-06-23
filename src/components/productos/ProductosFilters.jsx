import React from 'react';
import SelectField from '../common/forms/SelectField';
import InputField from '../common/forms/InputField';
import { FILTER_OPTIONS } from '../../utils/constants/validationRules';

const ProductosFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalProducts = 0,
  filteredProducts = 0
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  const handleQuickFilter = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.sortBy !== 'nombre_asc' || filters.itemsPerPage !== 10;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Filtros y Búsqueda
          </h6>
          <div className="d-flex align-items-center gap-3">
            <small className="text-muted">
              Mostrando {filteredProducts} de {totalProducts} productos
            </small>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClearFilters}
                title="Limpiar todos los filtros"
              >
                <i className="fas fa-times me-1"></i>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Formularios principales */}
        <div className="row g-3 mb-3">
          <div className="col-lg-4 col-md-6">
            <InputField
              label="Buscar Producto"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Buscar por nombre o descripción..."
              icon="fas fa-search"
              className="mb-0"
            />
          </div>

          <div className="col-lg-2 col-md-6">
            <SelectField
              label="Estado"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              options={FILTER_OPTIONS.STATUS}
              icon="fas fa-flag"
              className="mb-0"
            />
          </div>

          <div className="col-lg-3 col-md-6">
            <SelectField
              label="Ordenar Por"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleInputChange}
              options={FILTER_OPTIONS.SORT_BY}
              icon="fas fa-sort"
              className="mb-0"
            />
          </div>

          <div className="col-lg-3 col-md-6">
            <SelectField
              label="Productos por Página"
              name="itemsPerPage"
              value={filters.itemsPerPage}
              onChange={handleInputChange}
              options={FILTER_OPTIONS.ITEMS_PER_PAGE}
              icon="fas fa-list"
              className="mb-0"
            />
          </div>
        </div>



        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="alert alert-info py-2 mb-0">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="me-2">
                <i className="fas fa-info-circle me-1"></i>
                <strong>Filtros activos:</strong>
              </span>
              
              {filters.search && (
                <span className="badge bg-primary">
                  Búsqueda: "{filters.search}"
                </span>
              )}
              
              {filters.status && (
                <span className="badge bg-success">
                  Estado: {FILTER_OPTIONS.STATUS.find(s => s.value === filters.status)?.label}
                </span>
              )}
              
              {filters.sortBy !== 'nombre_asc' && (
                <span className="badge bg-info">
                  Orden: {FILTER_OPTIONS.SORT_BY.find(s => s.value === filters.sortBy)?.label}
                </span>
              )}
              
              {filters.itemsPerPage !== 10 && (
                <span className="badge bg-secondary">
                  Por página: {filters.itemsPerPage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosFilters; 