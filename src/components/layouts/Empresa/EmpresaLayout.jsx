import React from 'react';
import { Outlet } from 'react-router-dom';
import EmpresaHeader from './EmpresaHeader';

export default function EmpresaLayout() {
  return (
    <div className="min-vh-100 bg-light">
      <EmpresaHeader />
      <main className="container-fluid py-4">
        <Outlet />
      </main>
    </div>
  );
} 