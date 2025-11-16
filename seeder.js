import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert sample products
    await Product.insertMany(products);

    // Create an admin user
    const adminUser = new User({
      name: 'venky_admin',
      email: 'VenkyCrustyloaf@example.com',
      password: 'Crustyloaf@987', // Will be hashed by pre-save hook
      isAdmin: true,
      addresses: [
         { id: 'a1', street: 'N-K-N Nagar', city: 'Kurnool', state: 'Andhra-pradesh', zip: '518002', default: true },
      ]
    });
    
    await adminUser.save();

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}