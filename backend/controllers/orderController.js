const Order = require('../models/Order');

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'projectId',
        select: 'title description price images category sourceCodeUrl',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('projectId', 'title price')
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all orders',
      error: error.message
    });
  }
};

// @desc    Export orders with filters (Admin)
// @route   GET /api/admin/orders/export
// @access  Private/Admin
exports.exportOrders = async (req, res) => {
  try {
    const { filterType, year, month, startDate, endDate, status } = req.query;

    // Build query filter
    let dateFilter = {};

    if (filterType === 'yearly' && year) {
      // Filter by year
      const yearNum = parseInt(year);
      dateFilter = {
        createdAt: {
          $gte: new Date(`${yearNum}-01-01`),
          $lte: new Date(`${yearNum}-12-31T23:59:59.999Z`)
        }
      };
    } else if (filterType === 'monthly' && year && month) {
      // Filter by month and year
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    } else if (filterType === 'dateRange' && startDate && endDate) {
      // Filter by date range
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      };
    }

    // Build status filter
    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter = { status };
    }

    // Combine filters
    const query = { ...dateFilter, ...statusFilter };

    // Fetch filtered orders
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('projectId', 'title price')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = orders.map(order => ({
      orderId: order._id,
      orderIdShort: order._id.toString().slice(-8),
      customerName: order.userId?.name || 'N/A',
      customerEmail: order.userId?.email || 'N/A',
      projectName: order.projectId?.title || 'Deleted Project',
      amount: order.amount || 0,
      paymentMethod: order.paymentMethod || 'other',
      date: order.createdAt,
      status: order.status,
      razorpayPaymentId: order.razorpayPaymentId || 'N/A',
      razorpayOrderId: order.razorpayOrderId || 'N/A'
    }));

    // Calculate summary
    const summary = {
      totalOrders: exportData.length,
      totalAmount: exportData.reduce((sum, order) => sum + order.amount, 0),
      completedOrders: exportData.filter(o => o.status === 'completed').length,
      pendingOrders: exportData.filter(o => o.status === 'pending').length,
      failedOrders: exportData.filter(o => o.status === 'failed').length,
      completedAmount: exportData.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)
    };

    res.status(200).json({
      success: true,
      filters: {
        filterType,
        year,
        month,
        startDate,
        endDate,
        status
      },
      summary,
      count: exportData.length,
      data: exportData
    });

  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting orders',
      error: error.message
    });
  }
};
