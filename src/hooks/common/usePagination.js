import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejo de paginación
 * @param {Array} data - Datos a paginar
 * @param {number} initialPageSize - Tamaño inicial de página
 * @returns {Object} Objeto con datos paginados y funciones de control
 */
const usePagination = (data = [], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Calcular información de paginación
  const paginationInfo = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [data.length, currentPage, pageSize]);

  // Funciones de navegación
  const goToPage = (page) => {
    const totalPages = Math.ceil(data.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    const totalPages = Math.ceil(data.length / pageSize);
    setCurrentPage(totalPages);
  };

  // Cambiar tamaño de página
  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Resetear paginación
  const resetPagination = () => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  };

  // Generar números de página para mostrar
  const getPageNumbers = (maxVisible = 5) => {
    const totalPages = paginationInfo.totalPages;
    const current = currentPage;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return {
    // Datos paginados
    paginatedData,
    
    // Información de paginación
    ...paginationInfo,
    
    // Funciones de navegación
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    
    // Configuración
    changePageSize,
    resetPagination,
    
    // Utilidades
    getPageNumbers
  };
};

export default usePagination; 