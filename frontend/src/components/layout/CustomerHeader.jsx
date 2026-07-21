import React from 'react';
import { Package, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const CustomerHeader = ({ title, setMobileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-orange-300 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 sticky top-0 z-30 shrink-0">
      <div className="px-4 sm:px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Hamburger for mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Brand icon */}
          <div className="hidden md:flex p-1.5 rounded-lg bg-orange-500 border border-orange-500">
            <Package className="h-4 w-4 text-white" />
          </div>

          <span className="font-bold text-white hidden sm:block text-[14px]">EquipRental</span>

          <span className="hidden sm:inline-flex items-center justify-center px-2 py-[3px] rounded bg-black/20 text-[10px] font-bold text-white/90 tracking-wide uppercase">
            Customer
          </span>

          <span className="font-medium text-white sm:ml-1.5 sm:border-l sm:border-orange-500 sm:pl-3 text-[14px]">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="text-[13px] font-medium text-orange-100 hidden sm:block">{user?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5 !text-white hover:bg-orange-700 transition-colors h-8 px-2.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
