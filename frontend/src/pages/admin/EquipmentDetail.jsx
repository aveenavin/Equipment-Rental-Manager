import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2, Package, ChevronLeft, ChevronRight, X, DollarSign, Tag, FileText } from 'lucide-react';
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

  const loadEquipment = useCallback(async () => {
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
  }, [id, navigate]);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!equipment) return null;

  const images = equipment.images || [];

  return (
    <div className={`min-h-screen ${canManage ? 'bg-slate-950' : 'bg-[#EBE8E1]'} text-slate-100 relative overflow-hidden pb-10`}>

      {/* Background Ambience */}
      {canManage && (
        <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />
      )}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />

      {/* Glow Orbs */}
      {canManage ? (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-primary-500/5 blur-[150px] rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          {/* Subtle bottom glow to complement the white */}
          <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-slate-900/20 blur-[150px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 lg:h-[calc(100vh-2rem)] flex flex-col">



        {/* FULL WIDTH STACKED LAYOUT */}
        <div className="flex flex-col gap-6 flex-1 min-h-0">

          {/* TOP ROW: Image + Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">

            {/* LEFT COLUMN: IMAGE */}
            <div className="lg:col-span-5 h-[350px] lg:h-auto flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 rounded-[2.5rem] bg-white shadow-[0_0_50px_rgba(255,255,255,0.05)] border-4 border-slate-800 overflow-hidden relative group flex items-center justify-center min-h-0"
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[imageIndex].url}
                      alt={equipment.name}
                      className="absolute inset-0 w-full h-full object-fill transition-transform duration-700 group-hover:scale-110"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-primary-500 hover:scale-110 text-white transition-all border border-white/10"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => setImageIndex((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-primary-500 hover:scale-110 text-white transition-all border border-white/10"><ChevronRight className="h-5 w-5" /></button>
                      </>
                    )}
                  </>
                ) : (
                  <Package className="h-24 w-24 text-slate-700" />
                )}
              </motion.div>

              {images.length > 1 && (
                <div className="flex justify-center gap-2 shrink-0">
                  {images.map((img, i) => (
                    <button key={img.publicId} onClick={() => setImageIndex(i)} className={`w-12 h-12 rounded-xl overflow-hidden border transition-all ${i === imageIndex ? 'border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600 opacity-50 hover:opacity-100'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: HEADER & PRICING */}
            <div className="lg:col-span-7 h-full flex flex-col gap-4 relative z-50">

              {/* ADMIN ACTIONS / NAVIGATION */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between shrink-0">
                <Link
                  to={canManage ? "/admin/equipment" : "/catalog"}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-100 transition-colors bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 backdrop-blur-md hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Inventory
                </Link>

                {canManage && (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-xl border-slate-700 font-bold" onClick={() => setShowEditModal(true)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="danger" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg shadow-red-500/20" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1.5">{equipment.category?.replace(/-/g, ' ')}</p>
                    <h1 className="text-3xl font-black text-slate-100 leading-tight mb-3">{equipment.name}</h1>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={equipment.status} />
                      <ConditionBadge condition={equipment.condition} />
                    </div>
                  </div>
                  {equipment.serialNumber && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Serial</p>
                      <p className="text-sm font-mono font-bold text-slate-300 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">{equipment.serialNumber}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-emerald-900/30 border border-emerald-600/40 relative overflow-hidden flex items-center justify-between group shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600/90 uppercase tracking-widest mb-0.5">Daily Rate</p>
                    <p className="text-2xl font-black text-emerald-500">₹{equipment.dailyRate}</p>
                  </div>
                  <Tag className="w-8 h-8 text-emerald-600/30 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Security Deposit</p>
                    <p className="text-2xl font-black text-slate-200">₹{equipment.securityDeposit}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-slate-600/30" />
                </div>
              </motion.div>

              {/* METADATA */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mt-2 shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Added By</p>
                  <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-[10px]">{equipment.createdBy?.name?.[0]?.toUpperCase() || '?'}</span>
                    {equipment.createdBy?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date Added</p>
                  <p className="text-sm font-bold text-slate-200 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
                    {new Date(equipment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* BOTTOM ROW: DETAILS (FULL WIDTH) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-[2rem] p-6 sm:p-8 lg:flex-1 flex flex-col lg:min-h-0 relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0 relative z-10">
              <FileText className="h-3.5 w-3.5" /> Details
            </h3>

            {/* Watermark Icon to fill empty space */}
            <Package className="absolute -bottom-12 -right-8 w-64 h-64 text-slate-800/20 -rotate-12 pointer-events-none z-0" />

            <div className="overflow-y-auto custom-scrollbar flex-1 pr-4 relative z-10">
              <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{equipment.description || "No description provided."}</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-700 pt-12 pb-8 mt-16 mx-4 sm:mx-8 lg:mx-12 xl:mx-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔧</span>
              <span className="font-black text-slate-200 text-lg tracking-tight">RentAll Platform Admin</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner for professional equipment rentals. Quality gear, reliable service, every time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {['𝕏', 'in', 'f', '▶'].map((s, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-700 text-slate-400 hover:text-amber-500 text-xs font-bold flex items-center justify-center transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
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
                    className="text-slate-400 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2"><span>📧</span> 73aveen@gmail.com</li>
              <li className="flex items-start gap-2"><span>📞</span> +91 9xxxxxxx</li>
              <li className="flex items-start gap-2"><span>📍</span> Bhopal, Madhya Pradesh, India</li>
              <li className="flex items-start gap-2"><span>🕐</span> Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-4">Legal</h4>
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
                    className="text-slate-400 hover:text-amber-500 text-sm font-medium transition-colors duration-200 text-left"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} RentAll Platform Admin. All rights reserved.</span>
          <span className="flex items-center gap-1">Built with <span className="text-amber-500">♥</span> for professionals</span>
        </div>
      </footer>

      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl my-4 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">Edit Equipment</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-8">
                <EquipmentForm equipment={equipment} onSuccess={handleEditSuccess} onCancel={() => setShowEditModal(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30 mb-5"><Trash2 className="h-8 w-8 text-red-400" /></div>
                <h3 className="text-2xl font-black text-slate-100 mb-3 tracking-tight">Delete Equipment?</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Are you absolutely sure you want to delete <span className="text-white font-bold">{equipment.name}</span>? This action cannot be undone.</p>
                <div className="flex gap-3 w-full">
                  <Button variant="secondary" className="flex-1 py-3 rounded-xl font-bold" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
                  <Button variant="danger" className="flex-1 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquipmentDetail;
