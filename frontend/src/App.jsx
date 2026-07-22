import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CheckEmail from './pages/public/CheckEmail';
import VerifyEmail from './pages/public/VerifyEmail';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import EquipmentCatalog from './pages/customer/EquipmentCatalog';
import MyRentals from './pages/customer/MyRentals';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EquipmentList from './pages/admin/EquipmentList';
import EquipmentDetail from './pages/admin/EquipmentDetail';
import CustomerList from './pages/admin/CustomerList';
import CustomerDetail from './pages/admin/CustomerDetail';
import AdminRentals from './pages/admin/AdminRentals';
import AdminReturns from './pages/admin/AdminReturns';
import ReturnDetail from './pages/admin/ReturnDetail';
import AdminPayments from './pages/admin/AdminPayments';
import MaintenanceLogs from './pages/admin/MaintenanceLogs';

// Shared pages
import RentalDetail from './pages/shared/RentalDetail';
import InvoicePage from './pages/shared/InvoicePage';
import {
  PrivacyPolicy,
  TermsConditions,
  RefundPolicy,
  CookiePolicy,
  AdminPolicies,
  AdminSecurity,
  AdminApiDocs,
  AdminSystemStatus,
} from './pages/shared/LegalPages';

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
            success: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
            
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="check-email" element={<CheckEmail />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsConditions />} />
            <Route path="refund" element={<RefundPolicy />} />
            <Route path="cookie" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Customer-facing routes — wrapped in shared CustomerLayout shell */}
          <Route
            element={<ProtectedLayout allowedRoles={['customer', 'admin', 'staff']} />}
          >
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/catalog"   element={<EquipmentCatalog />} />
              <Route path="/my-rentals"      element={<MyRentals />} />
              <Route path="/my-rentals/:id"  element={<RentalDetail />} />
            </Route>
          </Route>

          {/* Admin & Staff protected routes */}
          <Route
            path="/admin"
            element={<ProtectedLayout allowedRoles={['admin', 'staff']} />}
          >
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="equipment" element={<EquipmentList />} />
              <Route path="equipment/:id" element={<EquipmentDetail />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="rentals" element={<AdminRentals />} />
              <Route path="rentals/:id" element={<RentalDetail />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="returns/:id" element={<ReturnDetail />} />
              <Route path="maintenance" element={<MaintenanceLogs />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="policies" element={<AdminPolicies />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="api" element={<AdminApiDocs />} />
              <Route path="status" element={<AdminSystemStatus />} />
            </Route>
          </Route>

          {/* Invoice — any authenticated user */}
          <Route
            path="/invoice/:rentalId"
            element={<ProtectedLayout allowedRoles={['customer', 'admin', 'staff']} />}
          >
            <Route index element={<InvoicePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
