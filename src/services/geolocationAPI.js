// Servicio para obtener datos geográficos usando APIs externas gratuitas

// API base para países
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

// API para ciudades y estados (gratuita)
const COUNTRY_STATE_CITY_API = 'https://api.countrystatecity.in/v1';

// API key para Country State City (necesitas registrarte en https://countrystatecity.in/)
// Es gratuita hasta 100 requests por minuto
const CSC_API_KEY = 'TU_API_KEY_AQUI'; // Reemplazar con tu API key

// Cache para evitar múltiples requests
let paisesCache = null;
let ciudadesCache = {};

/**
 * Obtiene lista de países usando REST Countries API
 * @returns {Promise<Array>} Lista de países ordenada alfabéticamente
 */
export const obtenerPaises = async () => {
  try {
    // Si ya tenemos los países en cache, devolverlos
    if (paisesCache) {
      return paisesCache;
    }

    const response = await fetch(`${REST_COUNTRIES_API}/all?fields=name,cca2,translations`);
    
    if (!response.ok) {
      throw new Error('Error al obtener países');
    }

    const data = await response.json();
    
    // Procesar y ordenar países
    const paises = data
      .map(country => ({
        codigo: country.cca2,
        nombre: country.name.common,
        nombreEspanol: country.translations?.spa?.common || country.name.common
      }))
      .sort((a, b) => a.nombreEspanol.localeCompare(b.nombreEspanol));

    // Guardar en cache
    paisesCache = paises;
    
    return paises;
  } catch (error) {
    console.error('Error obteniendo países:', error);
    // Fallback a países básicos si falla la API
    return getFallbackPaises();
  }
};

/**
 * Obtiene ciudades/estados de un país usando Country State City API
 * @param {string} codigoPais - Código ISO del país (ej: 'CL', 'AR')
 * @returns {Promise<Array>} Lista de ciudades/estados del país
 */
export const obtenerCiudadesPorPais = async (codigoPais) => {
  try {
    // Verificar cache primero
    if (ciudadesCache[codigoPais]) {
      return ciudadesCache[codigoPais];
    }

    // Si no hay API key, usar datos básicos
    if (!CSC_API_KEY || CSC_API_KEY === 'TU_API_KEY_AQUI') {
      return getFallbackCiudades(codigoPais);
    }

    const headers = {
      'X-CSCAPI-KEY': CSC_API_KEY
    };

    // Primero obtener estados/provincias
    const statesResponse = await fetch(`${COUNTRY_STATE_CITY_API}/countries/${codigoPais}/states`, {
      headers
    });

    let ciudades = [];

    if (statesResponse.ok) {
      const states = await statesResponse.json();
      
      // Para cada estado, obtener sus ciudades
      for (const state of states.slice(0, 5)) { // Limitar a 5 estados para evitar muchas requests
        try {
          const citiesResponse = await fetch(
            `${COUNTRY_STATE_CITY_API}/countries/${codigoPais}/states/${state.iso2}/cities`,
            { headers }
          );
          
          if (citiesResponse.ok) {
            const cities = await citiesResponse.json();
            ciudades = [...ciudades, ...cities.map(city => city.name)];
          }
        } catch (error) {
          console.warn(`Error obteniendo ciudades para estado ${state.name}:`, error);
        }
      }

      // Si no hay ciudades, usar los estados como ciudades principales
      if (ciudades.length === 0) {
        ciudades = states.map(state => state.name);
      }
    } else {
      // Si no hay estados, intentar obtener ciudades directamente
      const citiesResponse = await fetch(`${COUNTRY_STATE_CITY_API}/countries/${codigoPais}/cities`, {
        headers
      });
      
      if (citiesResponse.ok) {
        const cities = await citiesResponse.json();
        ciudades = cities.map(city => city.name);
      }
    }

    // Ordenar y eliminar duplicados
    ciudades = [...new Set(ciudades)].sort();

    // Guardar en cache
    ciudadesCache[codigoPais] = ciudades;

    return ciudades;
  } catch (error) {
    console.error('Error obteniendo ciudades:', error);
    // Fallback a ciudades básicas
    return getFallbackCiudades(codigoPais);
  }
};

/**
 * Países de fallback si falla la API
 */
const getFallbackPaises = () => [
  { codigo: 'CL', nombre: 'Chile', nombreEspanol: 'Chile' },
  { codigo: 'AR', nombre: 'Argentina', nombreEspanol: 'Argentina' },
  { codigo: 'PE', nombre: 'Peru', nombreEspanol: 'Perú' },
  { codigo: 'CO', nombre: 'Colombia', nombreEspanol: 'Colombia' },
  { codigo: 'BR', nombre: 'Brazil', nombreEspanol: 'Brasil' },
  { codigo: 'MX', nombre: 'Mexico', nombreEspanol: 'México' },
  { codigo: 'EC', nombre: 'Ecuador', nombreEspanol: 'Ecuador' },
  { codigo: 'BO', nombre: 'Bolivia', nombreEspanol: 'Bolivia' },
  { codigo: 'UY', nombre: 'Uruguay', nombreEspanol: 'Uruguay' },
  { codigo: 'PY', nombre: 'Paraguay', nombreEspanol: 'Paraguay' },
  { codigo: 'VE', nombre: 'Venezuela', nombreEspanol: 'Venezuela' },
  { codigo: 'US', nombre: 'United States', nombreEspanol: 'Estados Unidos' },
  { codigo: 'ES', nombre: 'Spain', nombreEspanol: 'España' }
];

/**
 * Ciudades de fallback por país
 */
const getFallbackCiudades = (codigoPais) => {
  const fallbackData = {
    'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Chillán', 'Iquique', 'Puerto Montt', 'Punta Arenas'],
    'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Tucumán', 'Salta', 'Santa Fe', 'Neuquén'],
    'PE': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Huancayo', 'Chimbote', 'Tacna'],
    'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'],
    'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
    'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'],
    'EC': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta', 'Portoviejo', 'Ambato', 'Riobamba', 'Esmeraldas'],
    'BO': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Potosí', 'Oruro', 'Trinidad', 'Cobija', 'Riberalta'],
    'UY': ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes', 'Artigas'],
    'PY': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Limpio', 'Ñemby', 'Encarnación'],
    'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Ciudad Bolívar', 'Cumaná'],
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao']
  };

  return fallbackData[codigoPais] || ['Ciudad Principal'];
};

/**
 * Buscar ciudades por texto (útil para autocompletar)
 * @param {string} codigoPais - Código del país
 * @param {string} busqueda - Texto a buscar
 * @returns {Promise<Array>} Ciudades que coinciden con la búsqueda
 */
export const buscarCiudades = async (codigoPais, busqueda) => {
  try {
    const ciudades = await obtenerCiudadesPorPais(codigoPais);
    
    if (!busqueda || busqueda.length < 2) {
      return ciudades.slice(0, 10); // Mostrar primeras 10 si no hay búsqueda
    }

    const busquedaLower = busqueda.toLowerCase();
    return ciudades
      .filter(ciudad => ciudad.toLowerCase().includes(busquedaLower))
      .slice(0, 10); // Limitar a 10 resultados
      
  } catch (error) {
    console.error('Error buscando ciudades:', error);
    return [];
  }
};

/**
 * Limpiar cache (útil para forzar actualización)
 */
export const limpiarCache = () => {
  paisesCache = null;
  ciudadesCache = {};
};

// Configuración para usar APIs alternativas si es necesario
export const configurarAPI = (nuevaConfiguracion) => {
  if (nuevaConfiguracion.cscApiKey) {
    CSC_API_KEY = nuevaConfiguracion.cscApiKey;
  }
}; 