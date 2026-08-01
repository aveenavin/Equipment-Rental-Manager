import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const dashboardPath = user?.role === 'admin' || user?.role === 'staff' ? '/admin' : '/dashboard';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-2 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between gap-1">
          <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 font-bold text-base sm:text-xl text-slate-100 hover:text-primary-400 transition-colors shrink-0"
          >
            <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-accent-500 shrink-0" />
            <span className="shrink-0 truncate max-w-[120px] sm:max-w-none">EquipRental</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-orange-500/15 hover:border-orange-500/30 text-slate-300 hover:text-orange-400 text-xs sm:text-sm font-medium transition-all duration-200 shadow-md shadow-black/25 shrink-0"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Dashboard</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/30 text-slate-300 hover:text-red-400 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 shadow-md shadow-black/25 shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
              </>
            ) : (
              <>
                {/* Sign in — hover to black text */}
                <Link
                  to="/login"
                  className="relative shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-400 hover:text-black transition-all duration-200 hover:-translate-y-0.5 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-orange-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
                >
                  Sign&nbsp;in
                </Link>

                {/* Get Started — shine sweep + scale + arrow bounce */}
                <Link to="/register" className="shrink-0">
                  <button className="group relative flex items-center shrink-0 flex-nowrap gap-1 sm:gap-2 px-2 py-1.5 sm:px-5 sm:py-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 hover:-translate-y-0.5 text-white text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 overflow-hidden">
                    {/* Continuous looping shine */}
                    <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-btn-shine pointer-events-none" />
                    <span className="relative z-10 flex items-center shrink-0 flex-nowrap gap-1 sm:gap-2">
                      <span className="whitespace-nowrap">Get&nbsp;Started</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 ease-out" />
                    </span>
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-500">
            <Wrench className="h-4 w-4 text-accent-500" />
            <span>Equipment Rental Manager</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Equipment Rental Manager. Built with MERN stack.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
