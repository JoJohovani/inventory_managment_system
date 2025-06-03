import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Header from '../components/header/header';

const ProtectedLayout = () => {
     return (
          <div className="flex h-screen bg-background">
               <Sidebar />

               <div className="flex flex-col flex-1 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background-secondary">
                         <Outlet />

                    </main>
               </div>
          </div>
     );
};

export default ProtectedLayout;
