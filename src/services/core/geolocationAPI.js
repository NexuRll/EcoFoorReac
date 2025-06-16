// Configuración de la API de países y ciudades
const API_BASE_URL = 'https://countriesnow.space/api/v0.1';

// Cache para mejorar rendimiento
let paisesCache = null;
const ciudadesCache = new Map();

/**
 * Obtiene la lista completa de países desde la API
 * @returns {Promise<Array>} Lista de países con código y nombres
 */
export const obtenerPaises = async () => {
  // Si ya tenemos los países en cache, los devolvemos
  if (paisesCache) {
    console.log('🎯 Devolviendo países desde cache');
    return paisesCache;
  }

  try {
    console.log('🌍 Solicitando países a la API...');
    const response = await fetch(`${API_BASE_URL}/countries/positions`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Formato de respuesta inválido');
    }

    // Procesar y formatear la respuesta
    const paises = data.data.map(pais => ({
      codigo: pais.iso2,
      nombre: pais.name,
      nombreEspanol: traducirNombrePais(pais.name) || pais.name
    }));

    // Ordenar por nombre en español
    paises.sort((a, b) => a.nombreEspanol.localeCompare(b.nombreEspanol));

    // Guardar en cache
    paisesCache = paises;
    
    console.log(`✅ ${paises.length} países obtenidos y almacenados en cache`);
    return paises;
    
  } catch (error) {
    console.error('❌ Error al obtener países:', error);
    throw new Error('No se pudieron cargar los países. Verifique su conexión a internet.');
  }
};

/**
 * Obtiene las ciudades de un país específico
 * @param {string} codigoPais - Código ISO2 del país (ej: 'CL', 'US')
 * @returns {Promise<Array>} Lista de ciudades del país
 */
export const obtenerCiudadesPorPais = async (codigoPais) => {
  if (!codigoPais) {
    throw new Error('Código de país es requerido');
  }

  // Verificar cache
  const cacheKey = codigoPais.toUpperCase();
  if (ciudadesCache.has(cacheKey)) {
    console.log(`🎯 Devolviendo ciudades de ${codigoPais} desde cache`);
    return ciudadesCache.get(cacheKey);
  }

  try {
    console.log(`🏙️ Solicitando ciudades para ${codigoPais}...`);
    
    // Corregir la URL y usar GET en lugar de POST
    const response = await fetch(`${API_BASE_URL}/countries/cities/q?country=${codigoPais}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.warn(`⚠️ No se encontraron ciudades para ${codigoPais}`);
      // En caso de error, usar datos por defecto inmediatamente
      const ciudadesPorDefecto = obtenerCiudadesPorDefecto(codigoPais);
      if (ciudadesPorDefecto.length > 0) {
        console.log(`🔄 Usando ciudades por defecto para ${codigoPais}`);
        ciudadesCache.set(cacheKey, ciudadesPorDefecto);
        return ciudadesPorDefecto;
      }
      return [];
    }

    // Procesar ciudades
    const ciudades = data.data
      .filter(ciudad => ciudad && typeof ciudad === 'string')
      .map(ciudad => ciudad.trim())
      .filter(ciudad => ciudad.length > 0)
      .sort((a, b) => a.localeCompare(b));

    // Guardar en cache
    ciudadesCache.set(cacheKey, ciudades);
    
    console.log(`✅ ${ciudades.length} ciudades obtenidas para ${codigoPais}`);
    return ciudades;
    
  } catch (error) {
    console.error(`❌ Error al obtener ciudades para ${codigoPais}:`, error);
    
    // En caso de error, intentar devolver datos por defecto para países conocidos
    const ciudadesPorDefecto = obtenerCiudadesPorDefecto(codigoPais);
    if (ciudadesPorDefecto.length > 0) {
      console.log(`🔄 Usando ciudades por defecto para ${codigoPais}`);
      ciudadesCache.set(cacheKey, ciudadesPorDefecto);
      return ciudadesPorDefecto;
    }
    
    throw new Error(`No se pudieron cargar las ciudades para el país seleccionado.`);
  }
};

/**
 * Traduce nombres de países del inglés al español
 * @param {string} nombreIngles - Nombre del país en inglés
 * @returns {string|null} Nombre en español o null si no se encuentra
 */
const traducirNombrePais = (nombreIngles) => {
  const traducciones = {
    'Afghanistan': 'Afganistán',
    'Albania': 'Albania',
    'Algeria': 'Argelia',
    'Argentina': 'Argentina',
    'Australia': 'Australia',
    'Austria': 'Austria',
    'Bangladesh': 'Bangladés',
    'Belgium': 'Bélgica',
    'Bolivia': 'Bolivia',
    'Brazil': 'Brasil',
    'Canada': 'Canadá',
    'Chile': 'Chile',
    'China': 'China',
    'Colombia': 'Colombia',
    'Costa Rica': 'Costa Rica',
    'Cuba': 'Cuba',
    'Denmark': 'Dinamarca',
    'Dominican Republic': 'República Dominicana',
    'Ecuador': 'Ecuador',
    'Egypt': 'Egipto',
    'El Salvador': 'El Salvador',
    'Finland': 'Finlandia',
    'France': 'Francia',
    'Germany': 'Alemania',
    'Greece': 'Grecia',
    'Guatemala': 'Guatemala',
    'Haiti': 'Haití',
    'Honduras': 'Honduras',
    'India': 'India',
    'Indonesia': 'Indonesia',
    'Iran': 'Irán',
    'Iraq': 'Irak',
    'Ireland': 'Irlanda',
    'Israel': 'Israel',
    'Italy': 'Italia',
    'Japan': 'Japón',
    'Mexico': 'México',
    'Netherlands': 'Países Bajos',
    'New Zealand': 'Nueva Zelanda',
    'Nicaragua': 'Nicaragua',
    'Norway': 'Noruega',
    'Panama': 'Panamá',
    'Paraguay': 'Paraguay',
    'Peru': 'Perú',
    'Poland': 'Polonia',
    'Portugal': 'Portugal',
    'Russia': 'Rusia',
    'South Korea': 'Corea del Sur',
    'Spain': 'España',
    'Sweden': 'Suecia',
    'Switzerland': 'Suiza',
    'Thailand': 'Tailandia',
    'Turkey': 'Turquía',
    'Ukraine': 'Ucrania',
    'United Kingdom': 'Reino Unido',
    'United States': 'Estados Unidos',
    'Uruguay': 'Uruguay',
    'Venezuela': 'Venezuela'
  };

  return traducciones[nombreIngles] || null;
};

/**
 * Devuelve ciudades por defecto para países específicos en caso de error de API
 * @param {string} codigoPais - Código ISO2 del país
 * @returns {Array} Lista de ciudades por defecto
 */
const obtenerCiudadesPorDefecto = (codigoPais) => {
  const ciudadesPorDefecto = {
    'CL': [
      'Arica', 'Iquique', 'Antofagasta', 'Calama', 'Copiapó', 'La Serena', 'Coquimbo',
      'Valparaíso', 'Viña del Mar', 'Santiago', 'Rancagua', 'Talca', 'Chillán',
      'Concepción', 'Temuco', 'Valdivia', 'Puerto Montt', 'Coyhaique', 'Punta Arenas'
    ],
    'AR': [
      'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán',
      'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'
    ],
    'PE': [
      'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Huancayo', 'Piura', 'Iquitos',
      'Cusco', 'Chimbote', 'Tacna'
    ],
    'CO': [
      'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta',
      'Soledad', 'Ibagué', 'Bucaramanga', 'Soacha'
    ],
    'US': [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose'
    ]
  };

  return ciudadesPorDefecto[codigoPais.toUpperCase()] || [];
};

/**
 * Limpia el cache de países y ciudades
 */
export const limpiarCache = () => {
  paisesCache = null;
  ciudadesCache.clear();
  console.log('🧹 Cache de geolocalización limpiado');
};

/**
 * Obtiene información del cache actual (para debugging)
 */
export const obtenerInfoCache = () => {
  return {
    paisesEnCache: paisesCache ? paisesCache.length : 0,
    ciudadesEnCache: ciudadesCache.size,
    paisesConCiudades: Array.from(ciudadesCache.keys())
  };
}; 