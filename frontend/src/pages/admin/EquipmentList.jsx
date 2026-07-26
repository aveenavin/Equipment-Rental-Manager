import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6">

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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
                  <div className="aspect-[4/3] w-full relative overflow-hidden rounded-t-xl">
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
                  <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950">

                    {/* Category badge */}
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        {item.category?.replace(/-/g, ' ')}
                      </span>
                      <div className="scale-90 origin-right">
                        <ConditionBadge condition={item.condition} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-100 text-[17px] leading-snug line-clamp-2 mb-4 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>

                    {/* Pricing box */}
                    <div className="mt-auto bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-4 shadow-inner flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Daily Rate</p>
                        <p className="text-xl font-black text-orange-500 leading-none">
                          ₹{item.dailyRate}<span className="text-[11px] font-semibold text-slate-400 ml-1">/day</span>
                        </p>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-800 mx-2" />
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Deposit</p>
                        <p className="text-sm font-bold text-slate-300 leading-none mt-1">₹{item.securityDeposit}</p>
                      </div>
                    </div>

                    {/* Admin action row */}
                    {canManage && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex gap-2.5 mt-2"
                      >
                        <button
                          onClick={() => setEditTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/80 hover:from-primary-600 hover:to-primary-700 text-slate-300 hover:text-white border border-slate-700 hover:border-primary-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:shadow-primary-600/20 text-[13px] font-bold transition-all duration-300 active:scale-95"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-800/80 hover:from-red-600 hover:to-red-700 text-slate-300 hover:text-white border border-slate-700 hover:border-red-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-lg hover:shadow-red-600/20 text-[13px] font-bold transition-all duration-300 active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
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
