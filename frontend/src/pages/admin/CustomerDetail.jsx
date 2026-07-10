import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar,
  ShieldCheck, ShieldOff, User,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomerById, updateCustomer, deleteCustomer } from '../../services/customerService';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
    <div className="p-1.5 rounded-lg bg-slate-800">
      <Icon className="h-4 w-4 text-slate-400" />
    </div>
    <div className="flex-1 flex justify-between items-center">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className="text-[13px] text-slate-200 font-medium">{value || '—'}</span>
    </div>
  </div>
);

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomer = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCustomerById(id);
      setCustomer(res.data.data.customer);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Customer not found.');
      navigate('/admin/customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCustomer(); }, [id]);

  const handleToggleStatus = async () => {
    if (!isAdmin) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = customer.status === 'active' ? 'suspended' : 'active';
      const res = await updateCustomer(id, { status: newStatus });
      setCustomer(res.data.data.customer);
      toast.success(`Account ${newStatus === 'active' ? 'activated' : 'suspended'}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted.');
      navigate('/admin/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d8d9e0] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!customer) return null;

  const isActive = customer.status === 'active';

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-200 transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </Link>

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#4558be]/10 border border-[#4558be]/20 text-[#4558be] font-bold flex items-center justify-center shrink-0">
                <span className="text-3xl">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">{customer.name}</h1>
                <p className="text-slate-400 text-[13px] mt-0.5">{customer.email}</p>
                <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 border border-white/20'
                    : 'bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-md shadow-red-500/20 border border-white/20'
                  }`}>
                  {isActive ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                  {isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 sm:items-end">
              {isAdmin && (
                <Button
                  variant={isActive ? 'danger' : 'secondary'}
                  size="sm"
                  isLoading={isTogglingStatus}
                  onClick={handleToggleStatus}
                  className="flex items-center gap-1.5 whitespace-nowrap !px-3 !py-1.5 !text-[13px]"
                >
                  {isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {isActive ? 'Suspend Account' : 'Activate Account'}
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 !px-3 !py-1.5 !text-[13px]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Account
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Account Information</h2>
          <DetailRow icon={User} label="Full Name" value={customer.name} />
          <DetailRow icon={Mail} label="Email Address" value={customer.email} />
          <DetailRow icon={Phone} label="Phone Number" value={customer.phone} />
          <DetailRow
            icon={Calendar}
            label="Registered"
            value={new Date(customer.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          />
          <DetailRow
            icon={Pencil}
            label="Last Updated"
            value={new Date(customer.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          />
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-900/30 border border-red-800">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Delete Customer</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Permanently delete <span className="text-slate-200 font-medium">"{customer.name}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
