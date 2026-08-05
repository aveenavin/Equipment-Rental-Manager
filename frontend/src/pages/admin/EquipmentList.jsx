import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Pencil, Trash2, Package, X, Activity } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge, ConditionBadge } from '../../components/equipment/EquipmentBadges';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import { fetchEquipment, deleteEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'heavy-machinery', label: 'Heavy Machinery' },
  { value: 'power-tools', label: 'Power Tools' },
  { value: 'lifting-equipment', label: 'Lifting Equipment' },
  { value: 'compressors', label: 'Compressors' },
  { value: 'generators', label: 'Generators' },
  { value: 'scaffolding', label: 'Scaffolding' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
    <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl my-8">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  </div>
);

const EquipmentList = () => {
  const { isAdmin, isStaff } = useAuth();
  const canManage = isAdmin || isStaff;
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchEquipment({ page, limit: 12, search, category, status, sort: 'newest' });
      setEquipment(res.data.data.equipment);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load equipment.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEquipment(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setEditTarget(null);
    loadEquipment();
  };

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 drop-shadow-sm pb-1">Equipment Inventory</h1>
            <p className="text-slate-400 text-xs mt-1">
              {pagination.total} item{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          {canManage && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Equipment
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2.5 mb-5">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4558be] transition-colors duration-200" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, description..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gradient-to-b from-white to-slate-50/80 border border-white !text-black placeholder-slate-400 text-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,1)] focus:outline-none focus:ring-[3px] focus:ring-[#4558be]/20 focus:border-[#4558be]/30 hover:border-slate-200 transition-all duration-300"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors duration-200">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-b from-[#6071dd] to-[#4558be] border border-[#7a8bea] text-white text-[13px] font-bold rounded-xl shadow-[0_2px_10px_-2px_rgba(69,88,190,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:from-[#6a7be5] hover:to-[#4d61cf] hover:shadow-[0_5px_15px_-3px_rgba(69,88,190,0.6)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#4558be]/30"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomDropdown
              icon={Filter}
              value={category}
              options={CATEGORIES}
              onChange={(val) => { setCategory(val); setPage(1); }}
            />
            <CustomDropdown
              icon={Activity}
              value={status}
              options={STATUSES}
              onChange={(val) => { setStatus(val); setPage(1); }}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" />
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
              <Package className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No equipment found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4"
            >
              {equipment.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                  onClick={() => navigate(`/admin/equipment/${item._id}`)}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-orange-700/50 hover:shadow-lg hover:shadow-orange-950/20 transition-all group cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-[3/2] w-full relative overflow-hidden rounded-t-xl">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                        <Package className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3.5 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950">

                    {/* Category badge */}
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        {item.category?.replace(/-/g, ' ')}
                      </span>
                      <div className="scale-[0.8] sm:scale-90 origin-right">
                        <ConditionBadge condition={item.condition} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-100 text-[15px] sm:text-[17px] leading-snug line-clamp-2 mb-3 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>

                    {/* Pricing box */}
                    <div className="mt-auto bg-slate-900/80 border border-slate-800 rounded-xl p-2 sm:p-3 mb-3 shadow-inner flex items-center justify-between">
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Daily Rate</p>
                        <p className="text-lg sm:text-xl font-black text-orange-500 leading-none">
                          ₹{item.dailyRate}<span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 ml-1">/day</span>
                        </p>
                      </div>
                      <div className="w-[1px] h-6 sm:h-8 bg-slate-800 mx-1.5 sm:mx-2" />
                      <div className="text-right">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Deposit</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-300 leading-none mt-1">₹{item.securityDeposit}</p>
                      </div>
                    </div>

                    {/* Admin action row */}
                    {canManage && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-row gap-2 sm:gap-2.5 mt-1 sm:mt-2"
                      >
                        <button
                          onClick={() => setEditTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/80 hover:from-green-600 hover:to-green-700 text-slate-300 hover:text-white border border-slate-700 hover:border-green-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:shadow-green-600/20 text-[11px] sm:text-[13px] font-bold transition-all duration-300 active:scale-95"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/80 hover:from-red-600 hover:to-red-700 text-slate-300 hover:text-white border border-slate-700 hover:border-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:shadow-red-600/20 text-[11px] sm:text-[13px] font-bold transition-all duration-300 active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-400 px-3">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-400 pt-12 pb-8 mt-16 mx-4 sm:mx-8 lg:mx-12 xl:mx-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔧</span>
              <span className="font-black text-gray-800 text-lg tracking-tight">RentAll Platform Admin</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your trusted partner for professional equipment rentals. Quality gear, reliable service, every time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {['𝕏', 'in', 'f', '▶'].map((s, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-400 hover:border-amber-500/50 hover:bg-amber-50 text-gray-500 hover:text-amber-500 text-xs font-bold flex items-center justify-center transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Dashboard', path: '/admin' },
                { label: 'Equipment', path: '/admin/equipment' },
                { label: 'Rentals', path: '/admin/rentals' },
                { label: 'Customers', path: '/admin/customers' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-500 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li className="flex items-start gap-2"><span>📧</span> 73aveen@gmail.com</li>
              <li className="flex items-start gap-2"><span>📞</span> +91 9xxxxxxx</li>
              <li className="flex items-start gap-2"><span>📍</span> Bhopal, Madhya Pradesh, India</li>
              <li className="flex items-start gap-2"><span>🕐</span> Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Admin Policies', path: '/admin/policies' },
                { label: 'Security Overview', path: '/admin/security' },
                { label: 'API Documentation', path: '/admin/api' },
                { label: 'System Status', path: '/admin/status' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-500 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-400 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} RentAll Platform Admin. All rights reserved.</span>
          <span className="flex items-center gap-1">Built with <span className="text-amber-500">♥</span> for professionals</span>
        </div>
      </footer>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Add New Equipment" onClose={() => setShowCreateModal(false)}>
          <EquipmentForm onSuccess={handleFormSuccess} onCancel={() => setShowCreateModal(false)} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title="Edit Equipment" onClose={() => setEditTarget(null)}>
          <EquipmentForm equipment={editTarget} onSuccess={handleFormSuccess} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-900/30 border border-red-800">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Delete Equipment</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="text-slate-200 font-medium">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
