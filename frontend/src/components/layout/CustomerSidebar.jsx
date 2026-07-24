import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Package,
  Calendar
} from 'lucide-react';

const CustomerSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
    { label: 'Browse Equipment', href: '/catalog', icon: Package },
    { label: 'My Rentals', href: '/my-rentals', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-blue-200 to-white border-r border-blue-100 transition-transform duration-300 ease-in-out md:static md:translate-x-0 w-[72px] shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto pt-8 pb-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.exact}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 group ${isActive
                  ? 'text-[#ea580c] hover:text-[#c2410c]'
                  : 'text-[#334155] hover:text-[#0f172a] hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Background & Left Border */}
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-[94%] bg-[#FFF3ED] border-l-[3px] border-[#ea580c] rounded-r-[14px] -z-10" />
                  )}

                  <item.icon
                    className={`h-[20px] w-[20px] mb-1.5 z-10 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''
                      }`}
                    strokeWidth={isActive ? 1.75 : 1.5}
                  />
                  <span className="text-[10px] font-semibold text-center leading-tight px-1 z-10 text-inherit">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default CustomerSidebar;
