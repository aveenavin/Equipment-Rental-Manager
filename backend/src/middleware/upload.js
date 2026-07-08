const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Store files in memory so we can stream them to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed.', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

/**
 * Streams a buffer to Cloudinary and returns the upload result.
 */
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(new AppError('Image upload failed. Please try again.', 500));
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Middleware: uploads req.files to Cloudinary and attaches results to req.uploadedImages.
 * Must be used after multer processes the multipart request.
 */
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    req.uploadedImages = [];
    return next();
  }

  try {
    const uploads = req.files.map((file) =>
      streamUpload(file.buffer, {
        folder: 'equipment-rental/equipment',
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
      })
    );

    const results = await Promise.all(uploads);
    req.uploadedImages = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
    }));
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes an image from Cloudinary by publicId.
 */
const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
