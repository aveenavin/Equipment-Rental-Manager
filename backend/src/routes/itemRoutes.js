const express = require('express');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const validate = require('../utils/validate');
const {
  createItemValidation,
  updateItemValidation,
  listItemValidation,
} = require('../validators/itemValidator');
const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const router = express.Router();

// Public routes — anyone can browse items
router.get('/', listItemValidation, validate, getAllItems);
router.get('/:id', getItem);

// Protected routes — Admin and Staff only
router.use(protect, authorize('admin', 'staff'));

router.post(
  '/',
  upload.array('images', 5),
  uploadToCloudinary,
  createItemValidation,
  validate,
  createItem
);

router.patch(
  '/:id',
  upload.array('images', 5),
  uploadToCloudinary,
  updateItemValidation,
  validate,
  updateItem
);

router.delete('/:id', deleteItem);

module.exports = router;
