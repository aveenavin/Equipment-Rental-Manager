const Equipment = require('../models/Equipment');
const AppError = require('../utils/AppError');

/**
 * Build a paginated, filtered, searched query for equipment.
 */
const listEquipment = async ({ page = 1, limit = 12, category, status, search, sort }) => {
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { dailyRate: 1 },
    'price-desc': { dailyRate: -1 },
    name: { name: 1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [equipment, total] = await Promise.all([
    Equipment.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .lean(),
    Equipment.countDocuments(filter),
  ]);

  return {
    equipment,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single equipment item by ID.
 */
const getEquipmentById = async (id) => {
  const equipment = await Equipment.findById(id)
    .populate('createdBy', 'name email')
    .lean();
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }
  return equipment;
};

/**
 * Create a new equipment item.
 */
const createEquipment = async ({ body, uploadedImages, userId }) => {
  const { name, description, category, dailyRate, securityDeposit, condition, serialNumber } = body;

  const equipment = await Equipment.create({
    name,
    description,
    category,
    dailyRate: parseFloat(dailyRate),
    securityDeposit: parseFloat(securityDeposit),
    condition: condition || 'good',
    serialNumber: serialNumber || null,
    images: uploadedImages || [],
    createdBy: userId,
  });

  return equipment;
};

/**
 * Update an existing equipment item. Appends new images; does not remove existing ones
 * unless deleteImageIds is specified.
 */
const updateEquipment = async ({ id, body, uploadedImages, deleteImageIds }) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  const updatableFields = [
    'name', 'description', 'category', 'dailyRate',
    'securityDeposit', 'status', 'condition', 'serialNumber',
  ];

  updatableFields.forEach((field) => {
    if (body[field] !== undefined) {
      if (field === 'dailyRate' || field === 'securityDeposit') {
        equipment[field] = parseFloat(body[field]);
      } else {
        equipment[field] = body[field];
      }
    }
  });

  // Remove images flagged for deletion
  if (deleteImageIds && deleteImageIds.length > 0) {
    equipment.images = equipment.images.filter(
      (img) => !deleteImageIds.includes(img.publicId)
    );
  }

  // Append newly uploaded images (respect 5-image limit)
  if (uploadedImages && uploadedImages.length > 0) {
    const remaining = 5 - equipment.images.length;
    if (remaining <= 0) {
      throw new AppError('Maximum of 5 images allowed. Remove existing images first.', 400);
    }
    equipment.images.push(...uploadedImages.slice(0, remaining));
  }

  await equipment.save();
  return equipment;
};

/**
 * Delete an equipment item by ID. Returns images that need Cloudinary cleanup.
 */
const deleteEquipment = async (id) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }
  const imagesToDelete = equipment.images.map((img) => img.publicId);
  await equipment.deleteOne();
  return imagesToDelete;
};

module.exports = {
  listEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
