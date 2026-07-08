const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * List customers (role: 'customer') with search, status filter, and pagination.
 */
const listCustomers = async ({ page = 1, limit = 15, search, status }) => {
  const filter = { role: 'customer' };

  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    customers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single customer by ID (must be role: 'customer').
 */
const getCustomerById = async (id) => {
  const customer = await User.findOne({ _id: id, role: 'customer' })
    .select('-password')
    .lean();

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }
  return customer;
};

/**
 * Update a customer's name, phone, or status.
 * Admins can suspend/unsuspend. Staff can only update name and phone.
 */
const updateCustomer = async ({ id, body, requestingUserRole }) => {
  const customer = await User.findOne({ _id: id, role: 'customer' });
  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  if (body.name !== undefined) customer.name = body.name;
  if (body.phone !== undefined) customer.phone = body.phone || null;

  // Only admins can change status
  if (body.status !== undefined) {
    if (requestingUserRole !== 'admin') {
      throw new AppError('Only administrators can change a customer status.', 403);
    }
    customer.status = body.status;
  }

  await customer.save();

  const result = customer.toObject();
  delete result.password;
  return result;
};

/**
 * Delete a customer account permanently. Admin only.
 */
const deleteCustomer = async (id) => {
  const customer = await User.findOne({ _id: id, role: 'customer' });
  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }
  await customer.deleteOne();
};

module.exports = { listCustomers, getCustomerById, updateCustomer, deleteCustomer };
