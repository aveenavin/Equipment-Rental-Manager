const catchAsync = require('../utils/catchAsync');
const customerService = require('../services/customerService');

// GET /api/v1/customers
const getAllCustomers = catchAsync(async (req, res) => {
  const { page, limit, search, status } = req.query;
  const result = await customerService.listCustomers({ page, limit, search, status });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// GET /api/v1/customers/:id
const getCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { customer },
  });
});

// PATCH /api/v1/customers/:id
const updateCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomer({
    id: req.params.id,
    body: req.body,
    requestingUserRole: req.user.role,
  });

  res.status(200).json({
    status: 'success',
    data: { customer },
  });
});

// DELETE /api/v1/customers/:id
const deleteCustomer = catchAsync(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  res.status(204).send();
});

module.exports = { getAllCustomers, getCustomer, updateCustomer, deleteCustomer };
