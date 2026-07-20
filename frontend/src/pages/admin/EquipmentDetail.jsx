import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, Package, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge, ConditionBadge } from '../../components/equipment/EquipmentBadges';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import { fetchEquipmentById, deleteEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAuth();
  const canManage = isAdmin || isStaff;

  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEquipmentById(id);
      setEquipment(res.data.data.equipment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Equipment not found.');
      navigate('/admin/equipment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEquipment(); }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEquipment(id);
      toast.success('Equipment deleted.');
      navigate('/admin/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadEquipment();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#d8d9e0] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!equipment) return null;

  const images = equipment.images || [];

  return (
    <div className="min-h-screen bg-[#d8d9e0] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Back */}
        <Link
          to="/admin/equipment"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-200 transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[imageIndex].url}
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImageIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === imageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-slate-600" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.publicId}
                    onClick={() => setImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imageIndex ? 'border-primary-500' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h1 className="text-xl font-bold text-slate-100 leading-snug">{equipment.name}</h1>
                <div className="flex gap-2 shrink-0 scale-90 origin-right">
                  <StatusBadge status={equipment.status} />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 capitalize">{equipment.category?.replace(/-/g, ' ')}</p>
            </div>

            <p className="text-slate-400 text-[13px] leading-relaxed">{equipment.description}</p>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-500 mb-0.5">Daily Rate</p>
                <p className="text-xl font-bold text-primary-400">₹{equipment.dailyRate}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-[11px] text-slate-500 mb-0.5">Security Deposit</p>
                <p className="text-xl font-bold text-slate-200">₹{equipment.securityDeposit}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Condition</span>
                <div className="scale-90 origin-right"><ConditionBadge condition={equipment.condition} /></div>
              </div>
              {equipment.serialNumber && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-slate-500">Serial Number</span>
                  <span className="text-slate-300 font-mono text-[11px]">{equipment.serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Added by</span>
                <span className="text-slate-300">{equipment.createdBy?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-300">{new Date(equipment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Actions */}
            {canManage && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1.5"
                  onClick={() => setShowEditModal(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1.5"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">Edit Equipment</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <EquipmentForm equipment={equipment} onSuccess={handleEditSuccess} onCancel={() => setShowEditModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-900/30 border border-red-800">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Delete Equipment</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="text-slate-200 font-medium">"{equipment.name}"</span>? This cannot be undone.
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

export default EquipmentDetail;
