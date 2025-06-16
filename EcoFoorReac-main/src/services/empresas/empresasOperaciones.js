import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Constante para la colección de empresas
const EMPRESAS_COLLECTION = 'empresas';

/**
 * Obtiene todas las empresas desde Firestore
 * @returns {Promise<Array>} Array de empresas
 */
export const obtenerEmpresas = async () => {
  try {
    const empresasRef = collection(db, EMPRESAS_COLLECTION);
    const snapshot = await getDocs(empresasRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    throw new Error("No se pudieron cargar las empresas");
  }
};

/**
 * Obtiene una empresa específica por su ID
 * @param {string} id - ID de la empresa
 * @returns {Promise<Object>} Datos de la empresa
 */
export const obtenerEmpresaPorId = async (id) => {
  try {
    const empresaRef = doc(db, EMPRESAS_COLLECTION, id);
    const snapshot = await getDoc(empresaRef);
    
    if (!snapshot.exists()) {
      throw new Error("Empresa no encontrada");
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    throw new Error("No se pudo cargar la empresa");
  }
};

/**
 * Crea una nueva empresa en Firestore
 * @param {Object} empresaData - Datos de la empresa
 * @returns {Promise<string>} ID de la empresa creada
 */
export const crearEmpresa = async (empresaData) => {
  try {
    // Verificar si el RUT ya existe
    if (empresaData.rut) {
      const empresasRef = collection(db, EMPRESAS_COLLECTION);
      const q = query(empresasRef, where("rut", "==", empresaData.rut));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Ya existe una empresa con este RUT");
      }
    }
    
    // Preparar datos con timestamp
    const nuevaEmpresa = {
      ...empresaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Agregar a Firestore
    const docRef = await addDoc(collection(db, EMPRESAS_COLLECTION), nuevaEmpresa);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear empresa:", error);
    throw error;
  }
};

/**
 * Actualiza una empresa existente
 * @param {string} id - ID de la empresa a actualizar
 * @param {Object} empresaData - Nuevos datos de la empresa
 */
export const actualizarEmpresa = async (id, empresaData) => {
  try {
    // Verificar si el RUT ya existe en otra empresa
    if (empresaData.rut) {
      const empresasRef = collection(db, EMPRESAS_COLLECTION);
      const q = query(empresasRef, where("rut", "==", empresaData.rut));
      const querySnapshot = await getDocs(q);
      
      // Si hay alguna empresa con el mismo RUT que no sea la misma que estamos editando
      const rutExisteEnOtraEmpresa = querySnapshot.docs.some(doc => doc.id !== id);
      
      if (rutExisteEnOtraEmpresa) {
        throw new Error("Ya existe otra empresa con este RUT");
      }
    }
    
    // Preparar datos a actualizar
    const datosActualizados = {
      ...empresaData,
      updatedAt: serverTimestamp()
    };
    
    // Actualizar en Firestore
    const empresaRef = doc(db, EMPRESAS_COLLECTION, id);
    await updateDoc(empresaRef, datosActualizados);
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    throw error;
  }
};

/**
 * Elimina una empresa de Firestore
 * @param {string} id - ID de la empresa a eliminar
 */
export const eliminarEmpresa = async (id) => {
  try {
    const empresaRef = doc(db, EMPRESAS_COLLECTION, id);
    await deleteDoc(empresaRef);
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    throw new Error("No se pudo eliminar la empresa");
  }
};

/**
 * Busca empresas por nombre o RUT
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Array de empresas que coinciden con la búsqueda
 */
export const buscarEmpresas = async (termino) => {
  try {
    // Como Firestore no soporta búsquedas de texto completo, obtenemos todas las empresas
    // y filtramos del lado del cliente
    const empresas = await obtenerEmpresas();
    
    if (!termino) return empresas;
    
    const terminoLower = termino.toLowerCase();
    
    return empresas.filter(empresa => 
      empresa.nombre?.toLowerCase().includes(terminoLower) || 
      empresa.rut?.toLowerCase().includes(terminoLower)
    );
  } catch (error) {
    console.error("Error al buscar empresas:", error);
    throw new Error("Error en la búsqueda de empresas");
  }
}; 