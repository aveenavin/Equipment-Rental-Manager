const catchAsync = require('../utils/catchAsync');
const equipmentService = require('../services/equipmentService');
const { deleteFromCloudinary } = require('../middleware/upload');

// GET /api/v1/equipment
const getAllEquipment = catchAsync(async (req, res) => {
  const { page, limit, category, status, search, sort } = req.query;
  const result = await equipmentService.listEquipment({ page, limit, category, status, search, sort });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// GET /api/v1/equipment/:id
const getEquipment = catchAsync(async (req, res) => {
  const equipment = await equipmentService.getEquipmentById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { equipment },
  });
});

// POST /api/v1/equipment
const createEquipment = catchAsync(async (req, res) => {
  const equipment = await equipmentService.createEquipment({
    body: req.body,
    uploadedImages: req.uploadedImages,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { equipment },
  });
});

// PATCH /api/v1/equipment/:id
const updateEquipment = catchAsync(async (req, res) => {
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

  const equipment = await equipmentService.updateEquipment({
    id: req.params.id,
    body: req.body,
    uploadedImages: req.uploadedImages,
    deleteImageIds,
  });

  res.status(200).json({
    status: 'success',
    data: { equipment },
  });
});

// DELETE /api/v1/equipment/:id
const deleteEquipment = catchAsync(async (req, res) => {
  const imagesToDelete = await equipmentService.deleteEquipment(req.params.id);

  // Clean up Cloudinary images after DB deletion succeeds
  if (imagesToDelete.length > 0) {
    await Promise.all(imagesToDelete.map((publicId) => deleteFromCloudinary(publicId)));
  }

  res.status(204).send();
});

module.exports = {
  getAllEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
