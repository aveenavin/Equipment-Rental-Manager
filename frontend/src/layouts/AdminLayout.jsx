import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const location = useLocation();

  // Deduce title from location
  let title = 'Dashboard';
  if (location.pathname.includes('/admin/equipment')) title = 'Equipment';
  else if (location.pathname.includes('/admin/rentals')) title = 'Rentals';
  else if (location.pathname.includes('/admin/returns')) title = 'Returns';
  else if (location.pathname.includes('/admin/payments')) title = 'Payments';
  else if (location.pathname.includes('/admin/customers')) title = 'Customers';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader 
          title={title} 
          lastUpdated={lastUpdated} 
          setMobileOpen={setMobileOpen} 
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ setLastUpdated }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
