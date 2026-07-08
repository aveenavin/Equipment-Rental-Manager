import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Package, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge, ConditionBadge } from '../../components/equipment/EquipmentBadges';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import { fetchEquipment, deleteEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Equipment Inventory</h1>
            <p className="text-slate-400 text-sm mt-1">
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
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, description..."
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>

          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {equipment.map((item) => (
                <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-600 transition-colors group">
                  {/* Image */}
                  <div className="h-44 bg-slate-800 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 capitalize mb-2">{item.category?.replace('-', ' ')}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <ConditionBadge condition={item.condition} />
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary-400">${item.dailyRate}<span className="text-xs font-normal text-slate-500">/day</span></p>
                        <p className="text-xs text-slate-500">Deposit: ${item.securityDeposit}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Link
                          to={`/admin/equipment/${item._id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canManage && (
                          <>
                            <button
                              onClick={() => setEditTarget(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-primary-900/50 text-slate-400 hover:text-primary-400 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
