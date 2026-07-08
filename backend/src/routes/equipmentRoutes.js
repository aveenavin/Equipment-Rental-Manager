const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const validate = require('../utils/validate');
const {
  createEquipmentValidation,
  updateEquipmentValidation,
  listEquipmentValidation,
} = require('../validators/equipmentValidator');
const {
  getAllEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');

const router = express.Router();

// Public routes — anyone can browse equipment
router.get('/', listEquipmentValidation, validate, getAllEquipment);
router.get('/:id', getEquipment);

// Protected routes — Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

router.post(
  '/',
  upload.array('images', 5),
  uploadToCloudinary,
  createEquipmentValidation,
  validate,
  createEquipment
);

router.patch(
  '/:id',
  upload.array('images', 5),
  uploadToCloudinary,
  updateEquipmentValidation,
  validate,
  updateEquipment
);

router.delete('/:id', deleteEquipment);

module.exports = router;
