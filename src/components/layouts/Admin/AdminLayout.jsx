import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="ecofood-layout">
      <AdminSidebar />
      <div className="ecofood-main-content">
        <AdminHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}