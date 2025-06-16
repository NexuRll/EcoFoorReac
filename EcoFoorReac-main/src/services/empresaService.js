import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';



// Función para verificar las credenciales de una empresa
export const verificarCredencialesEmpresa = async (correo, contraseña) => {
  try {
    console.log('Verificando credenciales de empresa para:', correo);
    
    // Obtener referencia a la colección de empresas
    const empresasRef = collection(db, 'Empresas');
    
    // Crear consulta para buscar por correo (con C mayúscula como en Firestore)
    const q = query(empresasRef, where('Correo', '==', correo));
    console.log('Ejecutando consulta en Firestore...');
    
    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    console.log('Resultados encontrados:', querySnapshot.size);
    
    // Verificar si se encontró la empresa
    if (querySnapshot.empty) {
      console.error('No se encontró ninguna empresa con el correo:', correo);
      throw new Error('Empresa no encontrada');
    }
    
    // Obtener datos de la empresa
    const empresaDoc = querySnapshot.docs[0];
    const empresaData = empresaDoc.data();
    console.log('Empresa encontrada:', empresaData.nombre || 'Sin nombre');
    
    // Verificar si el campo contraseña existe
    if (!empresaData.hasOwnProperty('contraseña')) {
      console.error('La empresa no tiene campo contraseña definido');
      throw new Error('Error en la configuración de la empresa');
    }
    
    // Verificar la contraseña
    console.log('Verificando contraseña...');
    console.log('Contraseña almacenada:', empresaData.contraseña);
    console.log('Contraseña proporcionada:', contraseña);
    
    if (empresaData.contraseña !== contraseña) {
      console.error('Contraseña incorrecta para la empresa:', correo);
      throw new Error('Contraseña incorrecta');
    }
    
    console.log('Autenticación exitosa para empresa:', correo);
    
    // Si las credenciales son correctas, devolver la información de la empresa
    return {
      id: empresaDoc.id,
      ...empresaData,
      tipo: 'empresa', // Identificar que es una empresa
      // Agregar campos adicionales para compatibilidad con Firebase Auth
      email: empresaData.Correo, // Usar Correo con C mayúscula como está en Firestore
      correo: empresaData.Correo, // Mantener compatibilidad con el resto del código
      uid: empresaDoc.id
    };
  } catch (error) {
    console.error('Error al verificar credenciales de empresa:', error.message);
    throw error;
  }
};


