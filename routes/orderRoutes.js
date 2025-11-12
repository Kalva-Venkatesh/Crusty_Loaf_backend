import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { cart, address, deliveryNotes } = req.body;

  try {
    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // --- Server-side price verification ---
    // Get product IDs from cart
    const productIds = cart.map(item => item.productId);
    
    // Fetch all products from DB in one go
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    // Create a map for easy lookup
    const productMap = dbProducts.reduce((acc, product) => {
        acc[product._id.toString()] = product;
        return acc;
    }, {});

    let total = 0;
    const orderItems = cart.map(item => {
        const dbProduct = productMap[item.productId];
        if (!dbProduct) {
            throw new Error(`Product not found: ${item.productId}`);
        }
        
        const itemTotal = dbProduct.price * item.quantity;
        total += itemTotal;
        
        return {
            productId: item.productId,
            name: dbProduct.name,
            quantity: item.quantity,
            price: dbProduct.price, // Use price from DB, not from client
        };
    });
    // --- End verification ---

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total: total,
      address: address,
      deliveryNotes: deliveryNotes,
    });

    const createdOrder = await order.save();
    
    // Clear user's cart after successful order
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.status(201).json(createdOrder);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;