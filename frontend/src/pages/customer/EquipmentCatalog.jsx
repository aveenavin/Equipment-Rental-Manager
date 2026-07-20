import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Search, SlidersHorizontal, X, Package, ShoppingCart, ChevronDown, Truck, Zap, Activity, Wind, Shield, Box, Wrench } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/equipment/EquipmentBadges';
import BookingModal from '../../components/rental/BookingModal';
import { fetchEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [page, setPage] = useState(1);
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
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">

      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-slate-800/60">
        <h1 className="text-3xl sm:text-4xl tracking-tight drop-shadow-sm pb-1">
          <span className="font-extrabold text-slate-100">Equipment</span> <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Catalog</span>
        </h1>
        <p className="text-slate-400 font-medium text-[15px] mt-2 max-w-xl leading-relaxed">
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

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 min-w-[220px] px-5 py-3 rounded-[16px] bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 text-slate-100 text-[15px] font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
            <div className="absolute z-50 right-0 mt-2 w-[220px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className={`group w-full flex items-center gap-3 px-3 py-2 mb-0.5 last:mb-0 rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200 ${
                      isSelected 
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {equipment.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-orange-700/50 hover:shadow-lg hover:shadow-orange-950/20 transition-all group"
              >
                {/* Image */}
                <div className="h-44 bg-slate-800 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-slate-100 text-[18px] leading-snug line-clamp-2 mb-1.5 tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 tracking-wide capitalize mb-3">
                    {item.category?.replace(/-/g, ' ')}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[17px] font-bold text-orange-400">
                          ₹{item.dailyRate}
                          <span className="text-xs font-semibold text-slate-500 ml-1">/day</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Deposit: <span className="font-semibold text-slate-400">₹{item.securityDeposit}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleBook(item)}
                    >
                      <ShoppingCart className="h-4 w-4" /> Book Now
                    </Button>
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
    </div>
  );
};

export default EquipmentCatalog;
