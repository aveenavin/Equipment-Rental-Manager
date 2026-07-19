import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';

const CustomerSidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const navItems = [
    { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Browse Equipment', href: '/catalog',    icon: Package },
    { label: 'My Rentals',  href: '/my-rentals', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/*
        OUTER CONTAINER — only element that changes width.
        Uses overflow-hidden as a clipping mask (same pattern as AdminSidebar).
      */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 border-r border-orange-200 transition-all duration-300 ease-in-out md:static shadow-sm overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-16' : 'md:w-56'} w-56 shrink-0`}
      >
        {/*
          INNER CONTAINER — fixed w-56 so layout never recalculates on collapse.
        */}
        <div className="w-56 flex flex-col h-full">

          <div className="h-14 flex items-center px-3 border-b border-orange-100 shrink-0">
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 text-white transition-colors shrink-0"
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 text-white transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

            <span
              className={`ml-2.5 font-extrabold text-orange-200 text-[15px] tracking-tight whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                collapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Equip<span className="text-orange-600">Rental</span>
            </span>
          </div>

          <nav className="flex-1 overflow-x-hidden overflow-y-auto py-5 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center p-2.5 rounded-xl transition-colors duration-200 group ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-semibold shadow-sm ring-1 ring-orange-200/50'
                      : 'text-white hover:bg-white/10 hover:text-white font-medium'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <div className="min-w-[20px] flex justify-center shrink-0">
                  <item.icon className="h-4 w-4 transition-colors duration-200" />
                </div>
                <span
                  className={`ml-3 text-[13px] whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                    collapsed ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

        </div>
      </div>
    </>
  );
};

export default CustomerSidebar;
