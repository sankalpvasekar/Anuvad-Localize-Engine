import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Static Iridescent Background Shapes for Performance */}
      <div className="fixed top-[-10%] right-[-5%] w-[800px] h-[800px] bg-tertiary-container/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-secondary-container/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed top-[30%] left-[20%] w-[600px] h-[600px] bg-primary-container/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Sidebar />
      <main className="flex-1 p-10 overflow-auto z-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
