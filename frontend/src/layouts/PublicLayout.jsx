import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-500 hover:opacity-90 transition">
            <Wrench className="h-6 w-6 text-accent-500" />
            <span>EquipRental</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary-400 transition">Home</Link>
            <Link to="/login" className="text-sm font-medium hover:text-primary-400 transition">Login</Link>
            <Link to="/register" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-900/30 transition">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <Wrench className="h-5 w-5 text-accent-500" />
            <span>Equipment Rental Manager</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Equipment Rental Manager. Built with MERN stack.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
