import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CustomerSidebar from '../components/layout/CustomerSidebar';
import CustomerHeader from '../components/layout/CustomerHeader';

const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Derive page title from the current route
  let title = 'Dashboard';
  if (location.pathname.startsWith('/catalog'))    title = 'Equipment Catalog';
  else if (location.pathname.startsWith('/my-rentals')) title = 'My Rentals';

  return (
    <div className="flex min-h-screen bg-[#EBE8E1]">
      <CustomerSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <CustomerHeader
          title={title}
          setMobileOpen={setMobileOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
