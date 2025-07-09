import React from 'react';
import { Outlet } from 'react-router-dom';
import ClienteHeader from './ClienteHeader';
import ClienteSidebar from './ClienteSidebar';

const ClienteLayout = () => {
  return (
    <div className="ecofood-layout">
      <ClienteSidebar />
      <div className="ecofood-main-content">
        <ClienteHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClienteLayout;