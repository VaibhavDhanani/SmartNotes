import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
