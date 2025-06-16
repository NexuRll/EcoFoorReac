import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      
      {/* Contenido principal */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <AdminHeader 
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        {/* Área de contenido */}
        <main className="content-area">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay para móvil */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      {/* Estilos CSS integrados */}
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content.sidebar-collapsed {
          margin-left: 70px;
        }

        .content-area {
          flex: 1;
          padding: 1.5rem;
          overflow-x: auto;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
          
          .main-content.sidebar-collapsed {
            margin-left: 0;
          }
          
          .content-area {
            padding: 1rem;
          }
        }

        /* Animaciones suaves */
        * {
          transition: all 0.3s ease;
        }

        /* Scrollbar personalizado */
        .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-area::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .content-area::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
