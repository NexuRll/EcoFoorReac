import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/common/Home';
import HomeAuth from './pages/common/HomeAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RecuperarContrasena from './pages/auth/RecuperarContrasena';
import Perfil from './pages/common/Perfil';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/layouts/Admin/AdminLayout';
import EmpresaLayout from './components/layouts/Empresa/EmpresaLayout';
import ProtectedByRole from './routes/ProtectedByRole';
import ConfigPage from './pages/admin/ConfigPage';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import EmpresaDashboard from './pages/empresa/EmpresaDashboard';
import PerfilEmpresa from './pages/empresa/PerfilEmpresa';
import ProductosEmpresa from './pages/empresa/ProductosEmpresa';

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
      {/* Navbar eliminado - ahora cada layout maneja su propia navegación */}

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
              <Route path="clientes" element={<UsuariosPage />} />
              <Route path="usuarios" element={<Navigate to="/admin/clientes" replace />} />
              <Route path="administradores" element={<ConfigPage />} />
            </Route>
            
            {/* Rutas de empresa protegidas */}
            <Route path="/empresa" element={
              <ProtectedByRole allowed={['empresa']}>
                <EmpresaLayout />
              </ProtectedByRole>
            }>
              <Route index element={<Navigate to="/empresa/dashboard" />} />
              <Route path="dashboard" element={<EmpresaDashboard />} />
              <Route path="perfil" element={<PerfilEmpresa />} />
              <Route path="productos" element={<ProductosEmpresa />} />
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
      {/* AuthWrapper eliminado - funcionalidad movida al contexto */}
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
