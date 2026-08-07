const Item = require('../models/Item');
const Rental = require('../models/Rental');
const AppError = require('../utils/AppError');

/**
 * Build a paginated, filtered, searched query for items.
 */
const listItems = async ({ page = 1, limit = 12, category, status, search, sort }) => {
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$text = { $search: search };
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

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .lean(),
    Item.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single item by ID.
 */
const getItemById = async (id) => {
  const item = await Item.findById(id)
    .populate('createdBy', 'name email')
    .lean();
  if (!item) {
    throw new AppError('Item not found.', 404);
  }
  return item;
};

/**
 * Create a new item.
 */
const createItem = async ({ body, uploadedImages, userId }) => {
  const { name, description, category, dailyRate, securityDeposit, condition, serialNumber } = body;

  const item = await Item.create({
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

  return item;
};

/**
 * Update an existing item. Appends new images; does not remove existing ones
 * unless deleteImageIds is specified.
 */
const updateItem = async ({ id, body, uploadedImages, deleteImageIds }) => {
  const item = await Item.findById(id);
  if (!item) {
    throw new AppError('Item not found.', 404);
  }

  const updatableFields = [
    'name', 'description', 'category', 'dailyRate',
    'securityDeposit', 'status', 'condition', 'serialNumber',
  ];

  updatableFields.forEach((field) => {
    if (body[field] !== undefined) {
      if (field === 'dailyRate' || field === 'securityDeposit') {
        item[field] = parseFloat(body[field]);
      } else {
        item[field] = body[field];
      }
    }
  });

  // Remove images flagged for deletion
  if (deleteImageIds && deleteImageIds.length > 0) {
    item.images = item.images.filter(
      (img) => !deleteImageIds.includes(img.publicId)
    );
  }

  // Append newly uploaded images (respect 5-image limit)
  if (uploadedImages && uploadedImages.length > 0) {
    const remaining = 5 - item.images.length;
    if (remaining <= 0) {
      throw new AppError('Maximum of 5 images allowed. Remove existing images first.', 400);
    }
    item.images.push(...uploadedImages.slice(0, remaining));
  }

  await item.save();
  return item;
};

/**
 * Delete an item by ID. Returns images that need Cloudinary cleanup.
 */
const deleteItem = async (id) => {
  const item = await Item.findById(id);
  if (!item) {
    throw new AppError('Item not found.', 404);
  }

  // Prevent deletion if active rentals exist — would orphan rental records
  const activeRentalCount = await Rental.countDocuments({
    item: id,
    status: { $in: ['pending', 'confirmed', 'checked_out'] },
  });
  if (activeRentalCount > 0) {
    throw new AppError(
      `Cannot delete item with ${activeRentalCount} active rental(s). Resolve all active rentals first.`,
      400
    );
  }

  const imagesToDelete = item.images.map((img) => img.publicId);
  await item.deleteOne();
  return imagesToDelete;
};

module.exports = {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
