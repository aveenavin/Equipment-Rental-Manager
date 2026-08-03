import React from 'react';
import { BarChart3, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const AdminHeader = ({ title, lastUpdated, setMobileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-orange-300 bg-[#4558be] sticky top-0 z-30 shrink-0">
      <div className="px-4 sm:px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden md:flex p-1.5 rounded-lg bg-orange-500 border border-orange-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white hidden sm:block text-[14px]">RentAll Platform</span>
          <span className="text-[11px] px-3.5 py-1 bg-black/20 backdrop-blur-md border border-white/10 text-white/95 rounded-full shadow-inner hidden sm:block font-extrabold tracking-[0.2em] uppercase">Admin</span>
          <span className="font-medium text-white sm:ml-1.5 sm:border-l sm:border-orange-500 sm:pl-3 text-[14px]">{title}</span>
        </div>
        <div className="flex items-center gap-3.5">
          {lastUpdated && (
            <span className="text-[11px] text-orange-200 hidden md:block font-medium">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="text-[13px] font-medium text-orange-100 hidden sm:block">{user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white/80 hover:text-red-300 text-xs font-medium transition-all duration-200 active:scale-95 shadow-md shadow-black/25">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
