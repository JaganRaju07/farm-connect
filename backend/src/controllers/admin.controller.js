const { verifyFarmer, getPendingFarmers, getPlatformAnalytics } = require('../services/admin.service');

exports.getPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await getPendingFarmers();
    res.json({
      success: true,
      data: {
        verifications,
        count: verifications.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveFarmerVerification = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.farmerId);
    const adminId = req.user.userId;
    const { notes } = req.body;

    if (isNaN(farmerId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FARMER_ID', message: 'Invalid farmer ID' }
      });
    }

    const farmer = await verifyFarmer(farmerId, 'approved', notes);

    res.json({
      success: true,
      message: `${farmer.name} has been verified and approved`,
      data: { farmer }
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectFarmerVerification = async (req, res, next) => {
  try {
    const farmerId = parseInt(req.params.farmerId);
    const adminId = req.user.userId;
    const { reason } = req.body;

    if (isNaN(farmerId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FARMER_ID', message: 'Invalid farmer ID' }
      });
    }

    // Rejection reason is mandatory
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REASON_REQUIRED',
          message: 'Rejection reason must be at least 10 characters'
        }
      });
    }

    const farmer = await verifyFarmer(farmerId, 'rejected', reason.trim());

    res.json({
      success: true,
      message: `${farmer.name}'s application has been rejected`,
      data: { farmer }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const analytics = await getPlatformAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  res.json({ success: true, data: { token: 'admin_token' } });
};

exports.getAnalytics = async (req, res, next) => {
  res.json({ success: true, data: {} });
};

exports.getFarmers = async (req, res, next) => {
  res.json({ success: true, data: [] });
};

exports.suspendFarmer = async (req, res, next) => {
  res.json({ success: true });
};

exports.reinstateFarmer = async (req, res, next) => {
  res.json({ success: true });
};

exports.getConsumers = async (req, res, next) => {
  res.json({ success: true, data: [] });
};

exports.getOrders = async (req, res, next) => {
  res.json({ success: true, data: [] });
};
