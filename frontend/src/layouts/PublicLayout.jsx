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
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-slate-100 hover:text-primary-400 transition-colors"
          >
            <Wrench className="h-6 w-6 text-accent-500" />
            <span>EquipRental</span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Sign in — hover to black text */}
                <Link
                  to="/login"
                  className="relative text-sm font-semibold text-slate-400 hover:text-black transition-all duration-200 hover:-translate-y-0.5 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-orange-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
                >
                  Sign in
                </Link>

                {/* Get Started — shine sweep + scale + arrow bounce */}
                <Link to="/register">
                  <button className="group relative flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 hover:-translate-y-0.5 text-white text-sm font-bold tracking-wide shadow-md hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 overflow-hidden">
                    {/* Continuous looping shine */}
                    <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-btn-shine pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 ease-out" />
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
