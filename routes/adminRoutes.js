import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email') // Get user info
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;

  // Basic validation for status
  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
  if (!validStatuses.includes(status)) {
     return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;