import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Wrench, LogOut, LayoutDashboard } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-slate-100 px-3 py-2 transition-colors"
                >
                  Sign in
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
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
