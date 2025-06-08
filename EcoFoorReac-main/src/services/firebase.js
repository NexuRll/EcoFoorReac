// Importar Firebase v9 con sintaxis de módulos
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
let app;

// Verificar si Firebase ya está inicializado
if (!getApps().length) {
  try {
    console.log('Inicializando Firebase...');
    app = initializeApp(firebaseConfig);
    console.log('Firebase inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    throw new Error(`Error al inicializar Firebase: ${error.message}`);
  }
} else {
  app = getApp(); // Si ya está inicializado, obtener la instancia
  console.log('Usando instancia existente de Firebase');
}

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Crear una instancia secundaria de autenticación para operaciones administrativas
// Esto permite registrar usuarios sin afectar la sesión actual del usuario
const secondaryAuth = getAuth(app);

// Configurar Firebase para usar sesiones no persistentes (solo en memoria)
// Esto hace que la sesión se cierre cuando se cierra la pestaña o el navegador
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Firebase configurado para usar sesiones no persistentes');
  })
  .catch((error) => {
    console.error('Error al configurar persistencia:', error);
  });

// Configurar evento para limpiar el almacenamiento local al cerrar la página
window.addEventListener('beforeunload', () => {
  // Limpiar datos de sesión almacenados localmente
  localStorage.removeItem('firebase:authUser');
  sessionStorage.removeItem('firebase:authUser');
});

// Mensaje de confirmación
console.log('Firebase inicializado con proyecto:', firebaseConfig.projectId);

export { auth, db, secondaryAuth };