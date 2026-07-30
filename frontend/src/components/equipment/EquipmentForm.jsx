import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { X, Upload, Image as ImageIcon, Info, DollarSign, Tag } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { createEquipment, updateEquipment } from '../../services/equipmentService';

const CATEGORIES = [
  { value: 'heavy-machinery', label: 'Heavy Machinery' },
  { value: 'power-tools', label: 'Power Tools' },
  { value: 'lifting-equipment', label: 'Lifting Equipment' },
  { value: 'compressors', label: 'Compressors' },
  { value: 'generators', label: 'Generators' },
  { value: 'scaffolding', label: 'Scaffolding' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().min(1, 'Category is required'),
  dailyRate: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: 'Must be non-negative' }),
  securityDeposit: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: 'Must be non-negative' }),
  condition: z.string().min(1, 'Condition is required'),
  status: z.string().optional(),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
});

const EquipmentForm = ({ equipment, onSuccess, onCancel }) => {
  const isEdit = !!equipment;
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const existingImages = equipment?.images || [];
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: equipment?.name || '',
      description: equipment?.description || '',
      category: equipment?.category || '',
      dailyRate: equipment?.dailyRate?.toString() || '',
      securityDeposit: equipment?.securityDeposit?.toString() || '',
      condition: equipment?.condition || 'good',
      status: equipment?.status || 'available',
      serialNumber: equipment?.serialNumber || '',
    },
  });

  useEffect(() => {
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [newPreviews]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const totalImages = existingImages.length + newFiles.length + selected.length - imagesToDelete.length;
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed per equipment item.');
      return;
    }
    setNewFiles((prev) => [...prev, ...selected]);
    setNewPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDeleteExisting = (publicId) => {
    setImagesToDelete((prev) => prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') formData.append(key, value);
      });
      newFiles.forEach((file) => formData.append('images', file));
      if (isEdit && imagesToDelete.length > 0) formData.append('deleteImageIds', JSON.stringify(imagesToDelete));

      if (isEdit) {
        await updateEquipment(equipment._id, formData);
        toast.success('Equipment updated successfully.');
      } else {
        await createEquipment(formData);
        toast.success('Equipment created successfully.');
      }
      onSuccess();
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImagesCount = existingImages.length + newFiles.length - imagesToDelete.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      
      {errors.root && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" /> {errors.root.message}
        </div>
      )}

      {/* DENSE 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input id="name" label="Equipment Name" placeholder="e.g. Caterpillar 320" required error={errors.name?.message} {...register('name')} />
            </div>
            <Select id="category" label="Category" required error={errors.category?.message} {...register('category')}>
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Select id="condition" label="Condition" required error={errors.condition?.message} {...register('condition')}>
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Details <span className="text-red-400">*</span></label>
            <textarea
              id="description" rows={8} placeholder="Detailed description..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border text-slate-100 placeholder-slate-600 text-sm resize-none shadow-inner focus:outline-none focus:ring-1 ${errors.description ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700/50 focus:border-primary-500/50'}`}
              {...register('description')}
            />
            {errors.description && <p className="mt-1 text-[10px] font-bold text-red-400">{errors.description.message}</p>}
          </div>

          {/* Inline Media Uploader to save space */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Media Gallery</label>
            <div className="flex gap-2 items-center overflow-x-auto pb-1">
              
              {/* Upload Button Box */}
              {totalImagesCount < 5 && (
                <label className="flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-primary-500 hover:bg-primary-500/5 cursor-pointer group">
                  <Upload className="h-5 w-5 text-slate-500 group-hover:text-primary-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-primary-400">Add Image</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}

              {/* Thumbnails */}
              {existingImages.map((img) => (
                <div key={img.publicId} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-950/50 border border-slate-700">
                  <img src={img.url} alt="Equipment" className={`w-full h-full object-cover ${imagesToDelete.includes(img.publicId) ? 'opacity-30 grayscale' : ''}`} />
                  <button type="button" onClick={() => toggleDeleteExisting(img.publicId)} className="absolute top-1 right-1 bg-slate-900/80 rounded-full p-1 border border-white/10 hover:bg-red-500 text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={url} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-primary-500">
                  <img src={url} alt="New" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-red-500 rounded-full p-1 border border-white/10 hover:bg-red-600 text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Financials & Meta */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 space-y-4">
            <h3 className="text-xs font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2 mb-2"><DollarSign className="h-3.5 w-3.5" /> Pricing</h3>
            <Input id="dailyRate" label="Daily Rate (₹)" type="number" step="0.01" required error={errors.dailyRate?.message} {...register('dailyRate')} />
            <Input id="securityDeposit" label="Security Deposit (₹)" type="number" step="0.01" required error={errors.securityDeposit?.message} {...register('securityDeposit')} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Tag className="h-3.5 w-3.5" /> Identity</h3>
            <Input id="serialNumber" label="Serial Number" placeholder="Optional" error={errors.serialNumber?.message} {...register('serialNumber')} />
            {isEdit && (
              <Select id="status" label="Status" error={errors.status?.message} {...register('status')}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="border border-slate-700 hover:bg-slate-800 px-6 py-2.5 rounded-xl">Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-primary-600 to-indigo-600 px-8 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-primary-500/20" isLoading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Equipment'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
