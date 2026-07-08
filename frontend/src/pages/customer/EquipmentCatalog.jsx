import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, X, Package, ShoppingCart } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/equipment/EquipmentBadges';
import BookingModal from '../../components/rental/BookingModal';
import { fetchEquipment } from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Equipment Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse {pagination.total} available item{pagination.total !== 1 ? 's' : ''} ready to rent
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-7">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>

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
        </div>

        {/* Grid */}
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
                <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-600 transition-all group">
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

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 capitalize mb-3">{item.category?.replace(/-/g, ' ')}</p>

                    <div className="mt-auto pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-primary-400">
                            ${item.dailyRate}<span className="text-xs font-normal text-slate-500">/day</span>
                          </p>
                          <p className="text-xs text-slate-500">Deposit: ${item.securityDeposit}</p>
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
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-slate-400 px-3">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
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
