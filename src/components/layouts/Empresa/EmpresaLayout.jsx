import React from 'react';
import { Outlet } from 'react-router-dom';
import EmpresaHeader from './EmpresaHeader';
import EmpresaSidebar from './EmpresaSidebar';

export default function EmpresaLayout() {
  return (
    <div className="ecofood-layout">
      <EmpresaSidebar />
      <div className="ecofood-main-content">
        <EmpresaHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}