import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/user/cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user._id).populate('cart.productId', 'name price imageUrl');
    res.json(user.cart);
  } catch (err) {
     console.error(err.message);
     res.status(500).send('Server Error');
  }
});

// @desc    Update user's cart
// @route   PUT /api/user/cart
// @access  Private
router.put('/cart', protect, async (req, res) => {
  const { cart } = req.body; // Expects an array of { productId, quantity }
  try {
    const user = await User.findById(req.user._id);
    user.cart = cart;
    await user.save();
    res.json(user.cart);
  } catch (err) {
     console.error(err.message);
     res.status(500).send('Server Error');
  }
});

// @desc    Update user's addresses
// @route   PUT /api/user/addresses
// @access  Private
router.put('/addresses', protect, async (req, res) => {
    const { addresses } = req.body; // Expects an array of address objects
    try {
        const user = await User.findById(req.user._id);
        user.addresses = addresses;
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;