import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import HomeAuth from './pages/HomeAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import RecuperarContrasena from './pages/RecuperarContrasena';
import Perfil from './pages/Perfil';
import AuthWrapper from './components/AuthWrapper';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/layouts/Admin/AdminLayout';
import ProtectedByRole from './routes/ProtectedByRole';
import AdminUsuarios from './components/layouts/Admin/AdminUsuarios';
import AdminConfig from './components/layouts/Admin/AdminConfig';
import AdminEmpresas from './pages/empresas/AdminEmpresas';
import AdminDashboard from './pages/admin/AdminDashboard';

// Componente temporal de prueba para admin
const AdminTest = () => {
  const { userData, userType } = useAuth();
  return (
    <div className="container">
      <div className="alert alert-info">
        <h4>Prueba de Acceso de Administrador</h4>
        <p><strong>userData:</strong> {JSON.stringify(userData, null, 2)}</p>
        <p><strong>userType:</strong> {userType}</p>
        <p><strong>userData?.tipo:</strong> {userData?.tipo}</p>
      </div>
    </div>
  );
};

// Componente que utiliza el contexto de autenticación
const AppContent = () => {
  const { currentUser, userData, userType, loading } = useAuth();
  
  // Debug info para diagnosticar problemas de autenticación
  console.log('=== DEBUG INFO ===');
  console.log('currentUser:', currentUser);
  console.log('userData:', userData);
  console.log('userType:', userType);
  console.log('loading:', loading);
  console.log('userData?.tipo:', userData?.tipo);
  console.log('window.location.pathname:', window.location.pathname);
  console.log('==================');
  
  return (
    <div className="container-fluid p-0">
      {/* No mostramos Navbar en rutas de administración */}
      {!window.location.pathname.startsWith('/admin') && <Navbar />}

      <div className="container mt-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando la aplicación...</p>
          </div>
        ) : (
          <Routes>
            {/* Rutas públicas y de usuarios */}
            <Route path="/" element={currentUser ? <HomeAuth /> : <Home />} />
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
            <Route path="/recuperar-contrasena" element={!currentUser ? <RecuperarContrasena /> : <Navigate to="/" />} />
            <Route path="/perfil" element={currentUser ? <Perfil /> : <Navigate to="/login" />} />
            <Route path="/catalogo" element={currentUser ? <HomeAuth /> : <Navigate to="/login" />} />
            
            {/* Ruta temporal de prueba para admin */}
            <Route path="/admin-test" element={
              userData ? <AdminTest /> : <Navigate to="/login" />
            } />
            
            {/* Rutas de administración protegidas */}
            <Route path="/admin" element={
              <ProtectedByRole allowed={['admin']}>
                <AdminLayout />
              </ProtectedByRole>
            }>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="empresas" element={<AdminEmpresas />} />
              <Route path="clientes" element={<AdminUsuarios />} />
              <Route path="administradores" element={<AdminConfig />} />
            </Route>
            
            {/* Ruta por defecto */}
            <Route path="*" element={currentUser ? <HomeAuth /> : <Home />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
