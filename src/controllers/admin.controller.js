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
