const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shipper_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipper',
    required: true
  },
  
  order_date: {
    type: Date,
    default: Date.now
  },
  delivery_date: {
    type: Date,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  customer_phone: {
    type: String,
    required: true
  },
  customer_address: {
    type: String,
    required: true
  },
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  total_amount: {
    type: Number,
    required: true
  }
});
orderSchema.index({ shipper_id: 1, order_date: -1 });
module.exports = mongoose.model('Order', orderSchema);