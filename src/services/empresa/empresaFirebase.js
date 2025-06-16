import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit
} from "firebase/firestore";
import { auth, db, secondaryAuth } from "../core/firebase";

/**
 * Verifica si un email ya está registrado en el sistema
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} - True si el email ya existe
 */
const verificarEmailExistente = async (email) => {
  try {
    // Verificar en la colección de usuarios (clientes)
    const usuariosRef = collection(db, 'usuarios');
    const emailQuery = query(usuariosRef, where('correo', '==', email.toLowerCase()));
    const usuariosSnapshot = await getDocs(emailQuery);
    
    if (!usuariosSnapshot.empty) {
      return true;
    }
    
    // Verificar en la colección de empresas
    const empresasRef = collection(db, 'empresas');
    const empresasQuery = query(empresasRef, where('email', '==', email.toLowerCase()));
    const empresasSnapshot = await getDocs(empresasQuery);
    
    if (!empresasSnapshot.empty) {
      return true;
    }
    
    // Verificar en la colección de administradores
    const adminRef = collection(db, 'Administrador');
    const adminQuery = query(adminRef, where('Correo', '==', email.toLowerCase()));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verificando email:', error);
    return false; // En caso de error, permitir continuar
  }
};

/**
 * Registra una nueva empresa con autenticación en Firebase
 * @param {Object} empresaData - Datos de la empresa
 * @returns {Promise<Object>} - Datos de la empresa registrada
 */
export const registrarEmpresaConAuth = async (empresaData) => {
  try {
    console.log('🚀 Iniciando registro de empresa:', empresaData);
    
    const { nombre, email, password, rut, direccion, comuna, telefono } = empresaData;
    
    // Validar datos requeridos
    if (!nombre || !email || !password || !rut) {
      console.error('❌ Faltan campos requeridos:', { nombre: !!nombre, email: !!email, password: !!password, rut: !!rut });
      throw new Error('Faltan campos requeridos: nombre, email, password y rut');
    }
    
    const emailLimpio = email.trim().toLowerCase();
    const rutLimpio = rut.trim();
    
    console.log('✅ Datos validados:', { emailLimpio, rutLimpio, nombre });
    
    // Verificar si el email ya está en uso
    console.log('🔍 Verificando email existente...');
    const emailExiste = await verificarEmailExistente(emailLimpio);
    if (emailExiste) {
      console.error('❌ Email ya existe:', emailLimpio);
      throw new Error('Este email ya está registrado en el sistema. Por favor use otro email.');
    }
    console.log('✅ Email disponible');
    
    // Verificar si el RUT ya existe
    console.log('🔍 Verificando RUT existente...');
    const empresasRef = collection(db, 'empresas');
    const rutQuery = query(empresasRef, where('rut', '==', rutLimpio));
    const rutSnapshot = await getDocs(rutQuery);
    
    if (!rutSnapshot.empty) {
      console.error('❌ RUT ya existe:', rutLimpio);
      throw new Error('Ya existe una empresa registrada con este RUT. Verifique que el RUT sea correcto.');
    }
    console.log('✅ RUT disponible');
    
    // Crear usuario en Firebase Auth usando la instancia secundaria
    console.log('🔐 Creando usuario en Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailLimpio, password);
    const user = userCredential.user;
    console.log('✅ Usuario creado en Auth:', user.uid);
    
    // Enviar correo de verificación
    console.log('📧 Enviando correo de verificación...');
    await sendEmailVerification(user);
    console.log('✅ Correo de verificación enviado');
    
    // Preparar datos de la empresa para Firestore
    const empresaDoc = {
      nombre: nombre.trim(),
      email: emailLimpio,
      rut: rutLimpio,
      direccion: direccion?.trim() || '',
      comuna: comuna?.trim() || '',
      telefono: telefono?.trim() || '',
      tipo: 'empresa',
      tipoUsuario: 'empresa',
      activa: true,
      emailVerified: false, // Inicialmente no verificado
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uid: user.uid
    };
    
    console.log('💾 Guardando datos en Firestore...');
    // Guardar datos en Firestore en la colección 'empresas'
    await setDoc(doc(db, 'empresas', user.uid), empresaDoc);
    console.log('✅ Datos guardados en Firestore');
    
    // Cerrar sesión del usuario recién creado en la instancia secundaria
    if (secondaryAuth !== auth) {
      console.log('🚪 Cerrando sesión secundaria...');
      await secondaryAuth.signOut();
      console.log('✅ Sesión secundaria cerrada');
    }
    
    console.log('🎉 Empresa registrada correctamente:', {
      uid: user.uid,
      email: empresaDoc.email,
      nombre: empresaDoc.nombre,
      rut: empresaDoc.rut
    });
    
    return {
      uid: user.uid,
      ...empresaDoc,
      id: user.uid
    };
    
  } catch (error) {
    console.error('💥 Error al registrar empresa:', error);
    console.error('💥 Error code:', error.code);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    
    // Cerrar sesión en caso de error también
    if (secondaryAuth !== auth) {
      try {
        await secondaryAuth.signOut();
        console.log('🚪 Sesión secundaria cerrada después del error');
      } catch (signOutError) {
        console.log('❌ Error al cerrar sesión secundaria:', signOutError);
      }
    }
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este email ya está registrado en Firebase Auth. Use otro email.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('El formato del email es inválido');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('El registro de empresas está deshabilitado');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    } else if (error.message && error.message.includes('Firebase')) {
      throw new Error('Error de configuración de Firebase. Verifique las variables de entorno.');
    }
    
    throw error;
  }
};

/**
 * Actualiza los datos de una empresa existente
 * @param {string} empresaId - ID de la empresa
 * @param {Object} datosActualizados - Nuevos datos de la empresa
 * @returns {Promise<void>}
 */
export const actualizarEmpresaConAuth = async (empresaId, datosActualizados) => {
  try {
    // Si se incluye una nueva contraseña, actualizar en Auth
    if (datosActualizados.password) {
      // Nota: Para actualizar la contraseña en Firebase Auth necesitamos al usuario autenticado
      // Por ahora solo actualizamos Firestore
      console.log('Actualización de contraseña en Auth requiere implementación adicional');
    }
    
    // Preparar datos para Firestore (sin contraseña)
    const { password, ...datosFirestore } = datosActualizados;
    
    const datosParaActualizar = {
      ...datosFirestore,
      updatedAt: serverTimestamp()
    };
    
    // Actualizar en Firestore
    const empresaRef = doc(db, 'empresas', empresaId);
    await setDoc(empresaRef, datosParaActualizar, { merge: true });
    
    console.log('Empresa actualizada correctamente:', empresaId);
    
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw error;
  }
};

/**
 * Inicia sesión de una empresa
 * @param {string} email - Email de la empresa
 * @param {string} password - Contraseña de la empresa
 * @returns {Promise<Object>} - Datos de la empresa autenticada
 */
export const loginEmpresa = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verificar si es empresa en Firestore
    const empresaDoc = await getDoc(doc(db, 'empresas', user.uid));
    
    if (!empresaDoc.exists()) {
      await auth.signOut(); // Cerrar sesión si no es empresa
      throw new Error('Usuario no autorizado como empresa');
    }
    
    const empresaData = empresaDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      ...empresaData,
      tipo: 'empresa'
    };
    
  } catch (error) {
    console.error('Error en login de empresa:', error);
    throw error;
  }
};

// Servicio completo para gestión de empresas en Firebase
export const empresaService = {
  // Obtener todas las empresas
  obtenerEmpresas: async () => {
    try {
      const empresasRef = collection(db, 'empresas');
      const snapshot = await getDocs(empresasRef);
      
      const empresas = [];
      snapshot.forEach((doc) => {
        empresas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return empresas;
    } catch (error) {
      console.error('Error obteniendo empresas:', error);
      throw error;
    }
  },

  // Obtener empresa por ID
  obtenerEmpresaPorId: async (empresaId) => {
    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      const empresaDoc = await getDoc(empresaRef);
      
      if (empresaDoc.exists()) {
        return {
          id: empresaDoc.id,
          ...empresaDoc.data()
        };
      } else {
        throw new Error('Empresa no encontrada');
      }
    } catch (error) {
      console.error('Error obteniendo empresa:', error);
      throw error;
    }
  },

  // Crear nueva empresa
  crearEmpresa: async (datosEmpresa) => {
    try {
      const empresasRef = collection(db, 'empresas');
      
      const nuevaEmpresa = {
        ...datosEmpresa,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        activa: true
      };
      
      const docRef = await addDoc(empresasRef, nuevaEmpresa);
      
      return {
        id: docRef.id,
        ...nuevaEmpresa
      };
    } catch (error) {
      console.error('Error creando empresa:', error);
      throw error;
    }
  },

  // Actualizar empresa
  actualizarEmpresa: async (empresaId, datosActualizados) => {
    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      
      const datosParaActualizar = {
        ...datosActualizados,
        fechaActualizacion: serverTimestamp()
      };
      
      await updateDoc(empresaRef, datosParaActualizar);
      
      return await empresaService.obtenerEmpresaPorId(empresaId);
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      throw error;
    }
  },

  // Eliminar empresa
  eliminarEmpresa: async (empresaId) => {
    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      await deleteDoc(empresaRef);
      
      return true;
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      throw error;
    }
  },

  // Buscar empresas por nombre
  buscarEmpresasPorNombre: async (nombre) => {
    try {
      const empresasRef = collection(db, 'empresas');
      const q = query(
        empresasRef,
        where('nombre', '>=', nombre),
        where('nombre', '<=', nombre + '\uf8ff'),
        orderBy('nombre'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      
      const empresas = [];
      snapshot.forEach((doc) => {
        empresas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return empresas;
    } catch (error) {
      console.error('Error buscando empresas:', error);
      throw error;
    }
  },

  // Obtener empresas por estado
  obtenerEmpresasPorEstado: async (activa = true) => {
    try {
      const empresasRef = collection(db, 'empresas');
      const q = query(
        empresasRef,
        where('activa', '==', activa),
        orderBy('fechaCreacion', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const empresas = [];
      snapshot.forEach((doc) => {
        empresas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return empresas;
    } catch (error) {
      console.error('Error obteniendo empresas por estado:', error);
      throw error;
    }
  },

  // Cambiar estado de empresa (activar/desactivar)
  cambiarEstadoEmpresa: async (empresaId, activa) => {
    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      
      await updateDoc(empresaRef, {
        activa: activa,
        fechaActualizacion: serverTimestamp()
      });
      
      return await empresaService.obtenerEmpresaPorId(empresaId);
    } catch (error) {
      console.error('Error cambiando estado de empresa:', error);
      throw error;
    }
  },

  // Verificar si email de empresa ya existe
  verificarEmailUnico: async (email, empresaIdExcluir = null) => {
    try {
      const empresasRef = collection(db, 'empresas');
      const q = query(empresasRef, where('email', '==', email.toLowerCase()));
      
      const snapshot = await getDocs(q);
      
      // Si no hay documentos, el email es único
      if (snapshot.empty) {
        return true;
      }
      
      // Si hay documentos, verificar si es la misma empresa (para actualizaciones)
      if (empresaIdExcluir) {
        const docs = snapshot.docs;
        return docs.length === 1 && docs[0].id === empresaIdExcluir;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando email único:', error);
      return false;
    }
  },

  // Obtener estadísticas de empresas
  obtenerEstadisticasEmpresas: async () => {
    try {
      const empresasRef = collection(db, 'empresas');
      const snapshot = await getDocs(empresasRef);
      
      let activas = 0;
      let inactivas = 0;
      let total = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.activa) {
          activas++;
        } else {
          inactivas++;
        }
      });
      
      return {
        total,
        activas,
        inactivas,
        porcentajeActivas: total > 0 ? Math.round((activas / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

/**
 * Obtiene todas las empresas registradas
 * @returns {Promise<Array>} - Lista de empresas
 */
export const obtenerTodasLasEmpresas = async () => {
  try {
    const empresasRef = collection(db, 'empresas');
    const empresasQuery = query(empresasRef, orderBy('fechaRegistro', 'desc'));
    const snapshot = await getDocs(empresasQuery);
    
    const empresas = [];
    snapshot.forEach((doc) => {
      empresas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return empresas;
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw new Error('No se pudieron cargar las empresas');
  }
};

/**
 * Obtiene una empresa por su ID
 * @param {string} empresaId - ID de la empresa
 * @returns {Promise<Object>} - Datos de la empresa
 */
export const obtenerEmpresaPorId = async (empresaId) => {
  try {
    const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
    
    if (!empresaDoc.exists()) {
      throw new Error('Empresa no encontrada');
    }
    
    return {
      id: empresaDoc.id,
      ...empresaDoc.data()
    };
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    throw error;
  }
};

/**
 * Actualiza una empresa (solo datos de Firestore)
 * @param {string} empresaId - ID de la empresa
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<void>}
 */
export const actualizarEmpresa = async (empresaId, datosActualizados) => {
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    
    // Preparar datos para actualización
    const datosLimpios = {
      ...datosActualizados,
      updatedAt: serverTimestamp()
    };
    
    // Remover campos que no se deben actualizar
    delete datosLimpios.uid;
    delete datosLimpios.id;
    delete datosLimpios.fechaRegistro;
    delete datosLimpios.createdAt;
    
    await updateDoc(empresaRef, datosLimpios);
    
    console.log('Empresa actualizada correctamente:', empresaId);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw new Error('No se pudo actualizar la empresa');
  }
};

/**
 * Elimina una empresa del sistema
 * @param {string} empresaId - ID de la empresa
 * @returns {Promise<void>}
 */
export const eliminarEmpresa = async (empresaId) => {
  try {
    // Eliminar documento de Firestore
    await deleteDoc(doc(db, 'empresas', empresaId));
    
    console.log('Empresa eliminada correctamente:', empresaId);
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    throw new Error('No se pudo eliminar la empresa');
  }
};

/**
 * Cambia el estado activo/inactivo de una empresa
 * @param {string} empresaId - ID de la empresa
 * @param {boolean} activa - Nuevo estado
 * @returns {Promise<void>}
 */
export const cambiarEstadoEmpresa = async (empresaId, activa) => {
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, {
      activa: activa,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Empresa ${activa ? 'activada' : 'desactivada'} correctamente:`, empresaId);
  } catch (error) {
    console.error('Error al cambiar estado de empresa:', error);
    throw new Error('No se pudo cambiar el estado de la empresa');
  }
}; 