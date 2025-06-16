import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce
 * @param {any} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos
 * @returns {any} Valor con debounce aplicado
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer un timeout para actualizar el valor con debounce
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce; 