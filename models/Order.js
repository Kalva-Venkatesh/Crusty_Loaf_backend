import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true }, // Snapshot of name
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Snapshot of price
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    deliveryNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;