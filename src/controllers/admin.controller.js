import * as adminService from '../services/admin.service.js';

/**
 * Controller: Admin Login
 * @route POST /api/v1/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const result = await adminService.adminLoginService(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error. Please try again later.',
    });
  }
};

/**
 * Controller: Get all buyers with user details for Admin Portal
 * @route GET /api/v1/admin/buyers
 * @route GET /api/admin/buyers
 * @route GET /api/v1/buyer/all
 */
export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await adminService.getAllBuyersService();
    return res.status(200).json({
      success: true,
      count: buyers.length,
      data: buyers,
    });
  } catch (err) {
    console.error('[ADMIN BUYERS ERROR]', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch buyers list.',
    });
  }
};

/**
 * Controller: Update buyer profile by ID
 * @route PATCH /api/v1/admin/buyers/:id
 * @route PUT /api/v1/admin/buyers/:id
 */
export const updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};
    const updated = await adminService.updateBuyerService(id, updateData);
    return res.status(200).json({
      success: true,
      message: 'Buyer profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('[ADMIN UPDATE BUYER ERROR]', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update buyer profile.',
    });
  }
};

/**
 * Controller: Get all sellers with user details for Admin Portal
 * @route GET /api/v1/admin/sellers
 * @route GET /api/admin/sellers
 * @route GET /api/v1/seller/all
 */
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await adminService.getAllSellersService();
    return res.status(200).json({
      success: true,
      count: sellers.length,
      data: sellers,
    });
  } catch (err) {
    console.error('[ADMIN SELLERS ERROR]', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch sellers list.',
    });
  }
};

/**
 * Controller: Update seller profile / status by ID
 * @route PATCH /api/v1/admin/sellers/:id
 * @route PUT /api/v1/admin/sellers/:id
 */
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};
    const updated = await adminService.updateSellerService(id, updateData);
    return res.status(200).json({
      success: true,
      message: 'Seller profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('[ADMIN UPDATE SELLER ERROR]', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update seller profile.',
    });
  }
};
