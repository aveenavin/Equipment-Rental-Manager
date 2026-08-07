const catchAsync = require('../utils/catchAsync');
const itemService = require('../services/itemService');
const { deleteFromCloudinary } = require('../middleware/upload');

// GET /api/v1/items
const getAllItems = catchAsync(async (req, res) => {
  const { page, limit, category, status, search, sort } = req.query;
  const result = await itemService.listItems({ page, limit, category, status, search, sort });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// GET /api/v1/items/:id
const getItem = catchAsync(async (req, res) => {
  const item = await itemService.getItemById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { item },
  });
});

// POST /api/v1/items
const createItem = catchAsync(async (req, res) => {
  const item = await itemService.createItem({
    body: req.body,
    uploadedImages: req.uploadedImages,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { item },
  });
});

// PATCH /api/v1/items/:id
const updateItem = catchAsync(async (req, res) => {
  // deleteImageIds may be sent as a JSON string from multipart form data
  let deleteImageIds = [];
  if (req.body.deleteImageIds) {
    try {
      deleteImageIds = JSON.parse(req.body.deleteImageIds);
    } catch {
      deleteImageIds = Array.isArray(req.body.deleteImageIds)
        ? req.body.deleteImageIds
        : [req.body.deleteImageIds];
    }
  }

  // Delete flagged images from Cloudinary before updating DB
  if (deleteImageIds.length > 0) {
    await Promise.all(deleteImageIds.map((id) => deleteFromCloudinary(id)));
  }

  const item = await itemService.updateItem({
    id: req.params.id,
    body: req.body,
    uploadedImages: req.uploadedImages,
    deleteImageIds,
  });

  res.status(200).json({
    status: 'success',
    data: { item },
  });
});

// DELETE /api/v1/items/:id
const deleteItem = catchAsync(async (req, res) => {
  const imagesToDelete = await itemService.deleteItem(req.params.id);

  // Clean up Cloudinary images after DB deletion succeeds
  if (imagesToDelete.length > 0) {
    await Promise.all(imagesToDelete.map((publicId) => deleteFromCloudinary(publicId)));
  }

  res.status(204).send();
});

module.exports = {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
