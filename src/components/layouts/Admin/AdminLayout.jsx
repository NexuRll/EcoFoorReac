import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />
      <main className="container-fluid py-4">
        <Outlet />
      </main>
    </div>
  );
}
