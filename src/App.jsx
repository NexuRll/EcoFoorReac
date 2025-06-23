import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/common/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RecuperarContrasena from './pages/auth/RecuperarContrasena';
import Perfil from './pages/common/Perfil';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/layouts/Admin/AdminLayout';
import EmpresaLayout from './components/layouts/Empresa/EmpresaLayout';
import ClienteLayout from './components/layouts/Cliente/ClienteLayout';
import ProtectedByRole from './routes/ProtectedByRole';
import ConfigPage from './pages/admin/ConfigPage';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import EmpresaDashboard from './pages/empresa/EmpresaDashboard';
import PerfilEmpresa from './pages/empresa/PerfilEmpresa';
import ProductosEmpresa from './pages/empresa/ProductosEmpresa';
import ProductosCliente from './pages/cliente/ProductosCliente';

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
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="container mt-4">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando la aplicación...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-0">
      <div className="container mt-4">
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<Home />} />
          
          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          

          
          {/* Ruta temporal de prueba para admin */}
          <Route path="/admin-test" element={
            userData ? <AdminTest /> : <Navigate to="/login" replace />
          } />
          
          {/* Rutas de administración protegidas */}
          <Route path="/admin" element={
            <ProtectedByRole allowed={['admin']}>
              <AdminLayout />
            </ProtectedByRole>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
            <Route index element={<Navigate to="/empresa/dashboard" replace />} />
            <Route path="dashboard" element={<EmpresaDashboard />} />
            <Route path="perfil" element={<PerfilEmpresa />} />
            <Route path="productos" element={<ProductosEmpresa />} />
          </Route>
          
          {/* Rutas de cliente protegidas */}
          <Route path="/cliente" element={
            <ProtectedByRole allowed={['cliente', 'usuario']}>
              <ClienteLayout />
            </ProtectedByRole>
          }>
            <Route index element={<Navigate to="/cliente/productos" replace />} />
            <Route path="productos" element={<ProductosCliente />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          
          {/* Redirección del perfil global al perfil del cliente */}
          <Route path="/perfil" element={<Navigate to="/cliente/perfil" replace />} />
          
          {/* Redirección para evitar confusión entre singular y plural */}
          <Route path="/cliente/producto" element={<Navigate to="/cliente/productos" replace />} />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
