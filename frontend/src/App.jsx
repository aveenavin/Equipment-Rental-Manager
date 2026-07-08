import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <h2 className="text-5xl font-extrabold text-primary-500">404</h2>
    <p className="text-xl font-semibold text-slate-300">Page not found</p>
    <p className="text-slate-500 text-sm">The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#3b82f6', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />

        <Routes>
          {/* Public routes — accessible to everyone */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Customer protected routes */}
          <Route
            path="/dashboard"
            element={<ProtectedLayout allowedRoles={['customer', 'admin', 'staff']} />}
          >
            <Route index element={<CustomerDashboard />} />
          </Route>

          {/* Admin & Staff protected routes */}
          <Route
            path="/admin"
            element={<ProtectedLayout allowedRoles={['admin', 'staff']} />}
          >
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
