import React, { useState, useEffect } from 'react';
import { obtenerPaises, obtenerCiudadesPorPais } from '../services/geolocationAPI';

const SelectorPaisComunaAPI = ({
  paisSeleccionado,
  comunaSeleccionada,
  onPaisChange,
  onComunaChange,
  errores = {},
  disabled = false,
  paisLabel = "País",
  comunaLabel = "Ciudad/Comuna/Estado"
}) => {
  const [paises, setPaises] = useState([]);
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [loadingPaises, setLoadingPaises] = useState(true);
  const [loadingComunas, setLoadingComunas] = useState(false);

  // Cargar países al montar el componente
  useEffect(() => {
    const cargarPaises = async () => {
      try {
        console.log('🌍 Cargando países...');
        setLoadingPaises(true);
        const listaPaises = await obtenerPaises();
        console.log('✅ Países cargados:', listaPaises.length);
        setPaises(listaPaises);
      } catch (error) {
        console.error('❌ Error cargando países:', error);
      } finally {
        setLoadingPaises(false);
      }
    };

    cargarPaises();
  }, []);

  // Cargar comunas cuando cambia el país
  useEffect(() => {
    const cargarComunas = async () => {
      if (paisSeleccionado && paises.length > 0) {
        try {
          console.log('🏙️ Cargando ciudades para:', paisSeleccionado);
          setLoadingComunas(true);
          
          // Buscar el código del país seleccionado
          const paisEncontrado = paises.find(p => 
            p.nombreEspanol === paisSeleccionado || p.nombre === paisSeleccionado
          );
          
          console.log('🔍 País encontrado:', paisEncontrado);
          
          if (paisEncontrado) {
            const ciudades = await obtenerCiudadesPorPais(paisEncontrado.codigo);
            console.log('✅ Ciudades cargadas:', ciudades.length);
            setComunasDisponibles(ciudades);
            
            // Si la comuna seleccionada no está en la nueva lista, limpiarla
            if (comunaSeleccionada && !ciudades.includes(comunaSeleccionada)) {
              onComunaChange('');
            }
          } else {
            console.warn('⚠️ No se encontró el país:', paisSeleccionado);
            setComunasDisponibles([]);
          }
        } catch (error) {
          console.error('❌ Error cargando comunas:', error);
          setComunasDisponibles([]);
        } finally {
          setLoadingComunas(false);
        }
      } else {
        setComunasDisponibles([]);
        if (comunaSeleccionada) {
          onComunaChange('');
        }
      }
    };

    cargarComunas();
  }, [paisSeleccionado, paises]);

  // Manejar cambio de país
  const handlePaisChange = (e) => {
    const nuevoPais = e.target.value;
    console.log('🔄 Cambio de país:', nuevoPais);
    onPaisChange(nuevoPais);
  };

  // Manejar cambio de comuna (input de texto)
  const handleComunaChange = (e) => {
    const nuevaComuna = e.target.value;
    console.log('🔄 Cambio de comuna:', nuevaComuna);
    onComunaChange(nuevaComuna);
  };

  // Función para seleccionar ciudad sugerida
  const seleccionarCiudadSugerida = (ciudad) => {
    console.log('✅ Ciudad seleccionada:', ciudad);
    onComunaChange(ciudad);
  };

  console.log('🎯 Estado actual:', { 
    paisSeleccionado, 
    comunaSeleccionada, 
    paisesCount: paises.length, 
    comunasCount: comunasDisponibles.length 
  });

  return (
    <>
      {/* Selector de País */}
      <div className="mb-3">
        <label className="form-label">
          {paisLabel} *
          {loadingPaises && (
            <span className="ms-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </span>
          )}
        </label>
        
        <select
          className={`form-select ${errores.pais ? 'is-invalid' : ''}`}
          value={paisSeleccionado || ''}
          onChange={handlePaisChange}
          disabled={disabled || loadingPaises}
        >
          <option value="">
            {loadingPaises ? 'Cargando países...' : 'Selecciona un país'}
          </option>
          {paises.map((pais) => (
            <option key={pais.codigo} value={pais.nombreEspanol}>
              {pais.nombreEspanol}
            </option>
          ))}
        </select>
        
        {errores.pais && <div className="invalid-feedback">{errores.pais}</div>}
        
        {/* Debug info */}
        {!loadingPaises && (
          <div className="form-text text-muted">
            <i className="fas fa-globe me-1"></i>
            {paises.length > 0 ? (
              `${paises.length} países disponibles`
            ) : (
              'No se pudieron cargar los países'
            )}
            {paisSeleccionado && ` | País seleccionado: ${paisSeleccionado}`}
          </div>
        )}
      </div>

      {/* Campo de Comuna con autocompletado */}
      <div className="mb-3">
        <label className="form-label">
          {comunaLabel} *
          {loadingComunas && (
            <span className="ms-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </span>
          )}
        </label>
        
        {/* Input con autocompletado */}
        <input
          type="text"
          className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
          value={comunaSeleccionada || ''}
          onChange={handleComunaChange}
          disabled={disabled || !paisSeleccionado || loadingComunas}
          placeholder={
            !paisSeleccionado 
              ? 'Primero selecciona un país'
              : loadingComunas
              ? 'Cargando ciudades...'
              : comunasDisponibles.length === 0
              ? 'Escribe tu ciudad/comuna'
              : `Selecciona o escribe tu ${comunaLabel.toLowerCase()}`
          }
          list={paisSeleccionado ? `ciudades-${paisSeleccionado.replace(/\s+/g, '')}` : undefined}
          autoComplete="off"
        />
        
        {/* Datalist para autocompletado */}
        {paisSeleccionado && comunasDisponibles.length > 0 && (
          <datalist id={`ciudades-${paisSeleccionado.replace(/\s+/g, '')}`}>
            {comunasDisponibles.map((comuna, index) => (
              <option key={`${comuna}-${index}`} value={comuna}>
                {comuna}
              </option>
            ))}
          </datalist>
        )}
        
        {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
        
        {/* Información y ayuda */}
        <div className="form-text text-muted">
          <i className="fas fa-info-circle me-1"></i>
          {!paisSeleccionado ? (
            'Selecciona un país primero'
          ) : loadingComunas ? (
            'Cargando ciudades...'
          ) : comunasDisponibles.length > 0 ? (
            <>
              {comunasDisponibles.length} ciudades disponibles en {paisSeleccionado}. 
              <strong> Puedes seleccionar de la lista o escribir tu ciudad manualmente.</strong>
            </>
          ) : (
            <>
              <span className="text-warning">
                <i className="fas fa-exclamation-triangle me-1"></i>
                No se encontraron ciudades para {paisSeleccionado}.
              </span>
              <strong> Escribe tu ciudad/comuna manualmente.</strong>
            </>
          )}
        </div>
        
        {/* Sugerencias visibles */}
        {paisSeleccionado && !loadingComunas && comunasDisponibles.length > 0 && comunaSeleccionada && (
          <div className="mt-2">
            {(() => {
              const sugerencias = comunasDisponibles
                .filter(ciudad => 
                  ciudad.toLowerCase().includes(comunaSeleccionada.toLowerCase()) &&
                  ciudad.toLowerCase() !== comunaSeleccionada.toLowerCase()
                )
                .slice(0, 3);
              
              if (sugerencias.length > 0) {
                return (
                  <div>
                    <small className="text-muted">Sugerencias:</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {sugerencias.map((ciudad, index) => (
                        <button
                          key={index}
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                                                     onClick={() => seleccionarCiudadSugerida(ciudad)}
                          disabled={disabled}
                        >
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {ciudad}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>



      {/* Información sobre la fuente de datos */}
      <div className="alert alert-info py-2 mb-3">
        <small>
          <i className="fas fa-info-circle me-1"></i>
          <strong>💡 Tip:</strong> Los países y ciudades se cargan automáticamente desde APIs externas.
          {paises.length > 13 ? (
            <span className="text-success"> ✅ API completa activa</span>
          ) : (
            <span className="text-warning"> ⚠️ Usando datos básicos</span>
          )}
          <br/>
          <strong>Si tu ciudad no aparece:</strong> ¡No hay problema! Puedes escribirla manualmente en el campo de ciudad.
        </small>
      </div>
    </>
  );
};

export default SelectorPaisComunaAPI; 