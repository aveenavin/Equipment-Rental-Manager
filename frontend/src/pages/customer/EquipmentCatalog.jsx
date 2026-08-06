import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Search, SlidersHorizontal, X, Package, ShoppingCart, ChevronDown, Truck, Zap, Activity, Wind, Shield, Box, Wrench } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/equipment/EquipmentBadges';
import BookingModal from '../../components/rental/BookingModal';
import { fetchEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import useRestoredPage from '../../hooks/useRestoredPage';

const CountUp = ({ to, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: Package },
  { value: 'heavy-machinery', label: 'Heavy Machinery', icon: Truck },
  { value: 'power-tools', label: 'Power Tools', icon: Zap },
  { value: 'lifting-equipment', label: 'Lifting Equipment', icon: Activity },
  { value: 'compressors', label: 'Compressors', icon: Wind },
  { value: 'generators', label: 'Generators', icon: Shield },
  { value: 'scaffolding', label: 'Scaffolding', icon: Box },
  { value: 'vehicles', label: 'Vehicles', icon: Truck },
  { value: 'other', label: 'Other', icon: Wrench },
];

const EquipmentCatalog = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useRestoredPage();
  const [bookingTarget, setBookingTarget] = useState(null);

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEquipment = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchEquipment({
        page,
        limit: 12,
        search,
        category,
        status: 'available',
        sort: 'newest',
      });
      setEquipment(res.data.data.equipment);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load equipment.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  const prevPageRef = useRef(page);
  useEffect(() => {
    if (prevPageRef.current === page) return;
    prevPageRef.current = page;
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleBook = (item) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book equipment.');
      navigate('/login');
      return;
    }
    setBookingTarget(item);
  };

  return (
    <div className="py-6 px-2 sm:py-8 sm:px-4 lg:px-6 max-w-[1600px] mx-auto w-full">

      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-slate-800/60">
        <h1 className="text-3xl sm:text-4xl tracking-tight drop-shadow-sm pb-1">
          <span className="font-extrabold text-slate-100">Equipment</span> <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Catalog</span>
        </h1>
        <p className="text-slate-400 font-medium text-xs sm:text-[15px] mt-1 sm:mt-2 max-w-xl leading-relaxed">
          Browse {pagination.total} available item{pagination.total !== 1 ? 's' : ''} ready to rent
        </p>
      </div>

      {/* Search + category filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-7">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4558be] transition-colors duration-200" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search equipment..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gradient-to-b from-white to-slate-50/80 border border-white !text-black placeholder-slate-400 text-[16px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,1)] focus:outline-none focus:ring-[3px] focus:ring-[#4558be]/20 focus:border-[#4558be]/30 hover:border-slate-200 transition-all duration-300"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors duration-200"
              >
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

        <div className="relative w-full md:w-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 w-full md:min-w-[220px] px-5 py-3 rounded-[16px] bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 text-slate-100 text-[15px] font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-orange-500" />
              <span className="tracking-wide">
                {CATEGORIES.find(c => c.value === category)?.label || 'All Categories'}
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 left-0 right-0 md:left-auto md:right-0 mt-2 md:w-[220px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCategory(c.value);
                      setPage(1);
                      setIsDropdownOpen(false);
                    }}
                    className={`group w-full flex items-center gap-3 px-3 py-2 mb-0.5 last:mb-0 rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200 ${isSelected
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-black hover:text-white'
                      }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors ${isSelected ? 'text-orange-500' : 'text-gray-400 group-hover:text-white/80'}`} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid / states */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Spinner size="lg" />
        </div>
      ) : equipment.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
            <Package className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">No available equipment found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your search or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
            {equipment.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                onClick={() => navigate(`/catalog/${item._id}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-orange-700/50 hover:shadow-lg hover:shadow-orange-950/20 transition-all group cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-[8/5] sm:aspect-[4/3] w-full relative overflow-hidden rounded-t-xl">
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
                <div className="p-1.5 sm:p-4 flex flex-col flex-1 bg-gradient-to-b from-slate-900 to-slate-950 min-w-0">

                  {/* Category */}
                  <div className="mb-1.5 sm:mb-2.5">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20">
                      {item.category?.replace(/-/g, ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-100 text-[12px] sm:text-[15px] md:text-[17px] leading-snug line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-4 group-hover:text-orange-500 transition-colors">
                    {item.name}
                  </h3>

                  {/* Pricing Box */}
                  <div className="mt-auto bg-slate-900/80 border border-slate-800 rounded-lg sm:rounded-xl p-1.5 sm:p-3 mb-2 sm:mb-4 shadow-inner flex items-center justify-between overflow-hidden min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Daily Rate</p>
                      <p className="text-sm sm:text-lg md:text-xl font-black text-orange-500 leading-none truncate">
                        ₹{item.dailyRate}<span className="text-[9px] sm:text-[11px] font-semibold text-slate-400 ml-0.5 sm:ml-1">/day</span>
                      </p>
                    </div>
                    <div className="w-[1px] h-6 sm:h-8 bg-slate-800 mx-1 sm:mx-2 shrink-0" />
                    <div className="text-right min-w-0 flex-1">
                      <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Deposit</p>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-300 leading-none mt-1 truncate">₹{item.securityDeposit}</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBook(item); }}
                    className="w-full relative z-10 group/btn flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] sm:text-sm font-bold rounded-lg sm:rounded-xl overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 group-hover/btn:-rotate-12 transition-transform duration-300" />
                    <span className="relative z-10 tracking-wide">Book Now</span>
                  </button>
                </div>
              </motion.div>
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

      {/* Booking modal — all logic unchanged */}
      {bookingTarget && (
        <BookingModal
          equipment={bookingTarget}
          onClose={() => setBookingTarget(null)}
          onBooked={() => {
            setBookingTarget(null);
            navigate('/my-rentals');
          }}
        />
      )}

      {/* ── Why Choose RentAll Platform? ─────────────────────────────────────── */}
      <div className="mt-20 mb-16">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Why Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">RentAll Platform?</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Everything you need for a seamless equipment rental experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: '🛡️',
              title: 'Verified Equipment',
              desc: 'Every item is inspected, certified, and maintained to the highest safety standards.',
              color: 'from-blue-500/10 to-transparent border-blue-800/30',
              accent: 'text-blue-400',
            },
            {
              icon: '🔒',
              title: 'Secure Booking',
              desc: 'Industry-grade encryption protects your bookings and payment details.',
              color: 'from-emerald-500/10 to-transparent border-emerald-800/30',
              accent: 'text-emerald-400',
            },
            {
              icon: '💰',
              title: 'Affordable Pricing',
              desc: 'Transparent, competitive rates with no hidden fees. Pay only for what you use.',
              color: 'from-orange-500/10 to-transparent border-orange-800/30',
              accent: 'text-orange-400',
            },
            {
              icon: '🕐',
              title: '24/7 Support',
              desc: 'Our dedicated support team is always available to assist you, day or night.',
              color: 'from-purple-500/10 to-transparent border-purple-800/30',
              accent: 'text-purple-400',
            },
          ].map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: index < 2 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 80, damping: 20 }}
              className={`group relative bg-gradient-to-b ${f.color} bg-slate-900 border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className={`text-base font-bold ${f.accent} mb-2`}>{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Statistics ─────────────────────────────────────────────────── */}
      <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            end: 500, suffix: '+', label: 'Equipment Available', icon: '🏗️',
            bg: 'from-blue-900/40 via-slate-900 to-slate-900', border: 'border-blue-500/20', text: 'from-blue-400 to-blue-600'
          },
          {
            end: 1200, suffix: '+', label: 'Happy Customers', icon: '🤝',
            bg: 'from-emerald-900/40 via-slate-900 to-slate-900', border: 'border-emerald-500/20', text: 'from-emerald-400 to-emerald-600'
          },
          {
            end: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐',
            bg: 'from-orange-900/40 via-slate-900 to-slate-900', border: 'border-orange-500/20', text: 'from-orange-400 to-orange-600'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 80, damping: 20 }}
            className={`flex flex-col items-center justify-center py-5 px-5 text-center group bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 relative overflow-hidden`}
          >
            {/* Optional glow effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500`} />

            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.1, type: 'spring', stiffness: 120, damping: 15 }}
              className="text-3xl mb-2 drop-shadow-md"
            >
              {stat.icon}
            </motion.span>
            <span className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.text} tracking-tight drop-shadow-sm`}>
              <CountUp to={stat.end} suffix={stat.suffix} />
            </span>
            <span className="text-slate-300 text-xs font-semibold mt-1 tracking-wide uppercase">{stat.label}</span>
          </motion.div>
        ))}
      </div>



      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-300/20 pt-8 sm:pt-12 pb-6 sm:pb-8 mt-10 sm:mt-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-10 mb-8 sm:mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <span className="font-black text-slate-100 text-sm sm:text-lg tracking-tight">RentAll Platform</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Your trusted partner for professional equipment rentals. Quality gear, reliable service, every time.
            </p>

          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">Support</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li className="flex items-start gap-1.5 sm:gap-2"><span>📧</span> 73aveen@gmail.com</li>
              <li className="flex items-start gap-1.5 sm:gap-2"><span>📞</span> +91 9xxxxxxx</li>
              <li className="flex items-start gap-1.5 sm:gap-2"><span>📍</span> indore, MP,  India</li>
              <li className="flex items-start gap-1.5 sm:gap-2"><span>🕐</span> Mon–Sat, 9 AM – 6 PM</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { label: 'Browse Catalog', path: '/catalog' },
                { label: 'My Rentals', path: '/my-rentals' },
                { label: 'Dashboard', path: '/dashboard' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center text-slate-500 hover:text-orange-400 text-xs sm:text-sm font-medium transition-colors duration-200 text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-all duration-200 underline underline-offset-[3px] decoration-slate-500/60 group-hover:decoration-orange-400/80">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">Legal</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Refund Policy', path: '/refund' },
                { label: 'Cookie Policy', path: '/cookie' }
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group inline-flex items-center text-slate-500 hover:text-orange-400 text-xs sm:text-sm font-medium transition-colors duration-200 text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-all duration-200 underline underline-offset-[3px] decoration-slate-500/60 group-hover:decoration-orange-400/80">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-300/20 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-600 text-center sm:text-left">
          <span>© {new Date().getFullYear()} RentAll Platform. All rights reserved.</span>
          <span className="flex items-center justify-center gap-1">Built with <span className="text-orange-500">♥</span> for professionals</span>
        </div>
      </footer>

    </div>
  );
};

export default EquipmentCatalog;
