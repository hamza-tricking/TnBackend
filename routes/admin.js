const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get dashboard statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');
    
    // Get total products count
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // Get new/active orders (pending or processing orders)
    const newOrders = await Order.countDocuments({ 
      orderStatus: { $in: ['pending', 'processing'] } 
    });
    const totalOrders = await Order.countDocuments({});
    
    // Get total customers (registered users + unique guest customer phones)
    const registeredCustomers = await User.countDocuments({ role: 'user' });
    const guestCustomerPhones = await Order.distinct('customerInfo.phone');
    const totalCustomers = Math.max(registeredCustomers, guestCustomerPhones.length) || 1;
    
    // Calculate total revenue from non-cancelled orders
    const validOrders = await Order.find({ orderStatus: { $ne: 'cancelled' } });
    const totalRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get recent orders (last 10 orders)
    const recentOrders = await Order.find({})
      .populate('user', 'username email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('📊 Dashboard stats:', {
      totalProducts,
      newOrders,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentOrdersCount: recentOrders.length
    });
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        newOrders,
        totalOrders,
        totalCustomers,
        totalRevenue,
        recentOrders: recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          customer: order.customerInfo?.fullName || order.user?.username || 'Unknown',
          amount: order.total,
          status: getOrderStatusText(order.orderStatus),
          date: new Date(order.createdAt).toLocaleDateString('ar-DZ', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
          }),
          orderStatus: order.orderStatus
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics' 
    });
  }
});

// Helper function to get Arabic status text
function getOrderStatusText(status) {
  const statusMap = {
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي'
  };
  return statusMap[status] || status;
}

module.exports = router;
