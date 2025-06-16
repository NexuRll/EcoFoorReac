import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RecuperarContrasena from '../pages/RecuperarContrasena';
import Home from '../pages/Home';
import HomeAuth from '../pages/HomeAuth';
import Perfil from '../pages/Perfil';
import ProtectedRoute from './ProtectedRoute';
import Navbar from '../components/Navbar';

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/home" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/home" />} />
          <Route path="/recuperar-contrasena" element={!currentUser ? <RecuperarContrasena /> : <Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/catalogo" element={
            <ProtectedRoute>
              <HomeAuth />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </>
  );
};

export default AppRouter;