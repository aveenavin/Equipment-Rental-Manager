import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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
  dailyRate: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: 'Daily rate must be a non-negative number',
  }),
  securityDeposit: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: 'Security deposit must be a non-negative number',
  }),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
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

  // Clean up object URLs on unmount
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
    setImagesToDelete((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') formData.append(key, value);
      });
      newFiles.forEach((file) => formData.append('images', file));
      if (isEdit && imagesToDelete.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(imagesToDelete));
      }

      if (isEdit) {
        await updateEquipment(equipment._id, formData);
        toast.success('Equipment updated successfully.');
      } else {
        await createEquipment(formData);
        toast.success('Equipment created successfully.');
      }
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError('root', { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {errors.root && (
        <div className="px-4 py-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
          {errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            id="name"
            label="Equipment Name"
            placeholder="e.g. Caterpillar 320 Excavator"
            required
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-300">
            Description <span className="text-red-400 ml-1">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Detailed description of the equipment..."
            className={`mt-1.5 w-full px-4 py-2.5 rounded-lg bg-slate-900 border text-slate-100 placeholder-slate-500 text-sm resize-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'}`}
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
        </div>

        <Select
          id="category"
          label="Category"
          required
          error={errors.category?.message}
          {...register('category')}
        >
          <option value="">Select category...</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </Select>

        <Select
          id="condition"
          label="Condition"
          required
          error={errors.condition?.message}
          {...register('condition')}
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </Select>

        <Input
          id="dailyRate"
          label="Daily Rate (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          required
          error={errors.dailyRate?.message}
          {...register('dailyRate')}
        />

        <Input
          id="securityDeposit"
          label="Security Deposit (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          required
          error={errors.securityDeposit?.message}
          {...register('securityDeposit')}
        />

        <Input
          id="serialNumber"
          label="Serial Number"
          placeholder="e.g. CAT-320-2023-001"
          error={errors.serialNumber?.message}
          {...register('serialNumber')}
        />

        {isEdit && (
          <Select
            id="status"
            label="Status"
            error={errors.status?.message}
            {...register('status')}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        )}
      </div>

      {/* Image management */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">
          Images <span className="text-slate-500 font-normal">(max 5)</span>
        </p>

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.publicId} className="relative group">
                <img
                  src={img.url}
                  alt="Equipment"
                  className={`w-24 h-24 object-cover rounded-lg border-2 transition-all ${
                    imagesToDelete.includes(img.publicId)
                      ? 'opacity-30 border-red-500'
                      : 'border-slate-700 group-hover:border-slate-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleDeleteExisting(img.publicId)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={imagesToDelete.includes(img.publicId) ? 'Undo remove' : 'Remove'}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image previews */}
        {newPreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {newPreviews.map((url, i) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-primary-700"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {(existingImages.length + newFiles.length - imagesToDelete.length) < 5 && (
          <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-slate-700 hover:border-primary-600 cursor-pointer transition-colors group w-fit">
            <Upload className="h-4 w-4 text-slate-400 group-hover:text-primary-400" />
            <span className="text-sm text-slate-400 group-hover:text-primary-400">
              {newFiles.length === 0 && existingImages.length === 0 ? 'Upload images' : 'Add more images'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {existingImages.length === 0 && newFiles.length === 0 && (
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>No images yet. Upload up to 5 images (max 5MB each).</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEdit ? 'Save changes' : 'Create equipment'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
