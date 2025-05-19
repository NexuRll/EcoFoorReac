import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Función para verificar las credenciales de un administrador
export const verificarCredencialesAdmin = async (correo, contraseña) => {
  try {
    console.log('Verificando credenciales de administrador para:', correo);
    
    // Obtener referencia a la colección de administradores
    const adminsRef = collection(db, 'Administrador');
    
    // Crear consulta para buscar por correo
    const q = query(adminsRef, where('Correo', '==', correo));
    console.log('Ejecutando consulta en Firestore para administrador...');
    
    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);
    console.log('Resultados encontrados para administrador:', querySnapshot.size);
    
    // Verificar si se encontró el administrador
    if (querySnapshot.empty) {
      console.error('No se encontró ningún administrador con el correo:', correo);
      throw new Error('Administrador no encontrado');
    }
    
    // Obtener datos del administrador
    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();
    console.log('Administrador encontrado:', adminData.Nombre || 'Sin nombre');
    
    // Verificar si el campo contraseña existe
    if (!adminData.hasOwnProperty('contraseña')) {
      console.error('El administrador no tiene campo contraseña definido');
      throw new Error('Error en la configuración del administrador');
    }
    
    // Verificar la contraseña
    console.log('Verificando contraseña del administrador...');
    console.log('Contraseña almacenada:', adminData.contraseña);
    console.log('Contraseña proporcionada:', contraseña);
    
    if (adminData.contraseña !== contraseña) {
      console.error('Contraseña incorrecta para el administrador:', correo);
      throw new Error('Contraseña incorrecta');
    }
    
    console.log('Autenticación exitosa para administrador:', correo);
    
    // Si las credenciales son correctas, devolver la información del administrador
    return {
      id: adminDoc.id,
      ...adminData,
      tipo: 'admin', // Identificar que es un administrador
      // Agregar campos adicionales para compatibilidad con Firebase Auth
      email: adminData.Correo, // Usar Correo con C mayúscula como está en Firestore
      correo: adminData.Correo, // Mantener compatibilidad con el resto del código
      uid: adminDoc.id
    };
  } catch (error) {
    console.error('Error al verificar credenciales de administrador:', error.message);
    throw error;
  }
};
