import React from 'react';
import { Outlet } from 'react-router-dom';
import NavCliente from './NavCliente';

const ClienteLayout = () => {
  return (
    <div className="cliente-layout">
      <NavCliente />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ClienteLayout; 