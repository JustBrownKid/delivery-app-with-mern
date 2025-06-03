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
  payment: {
    type: String,
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
  },
  tracking_id :{
    type: String,
  }
}, { timestamps: true });
orderSchema.index({ shipper_id: 1, order_date: -1 });


function generateTrackingId() {
  const randomPart = Math.floor(100000000000000000000 + Math.random() * 900000000000000000000);
  return `POZT${randomPart}`;
}

// Pre-save hook to generate shiper_id
orderSchema.pre('validate', async function (next) {

  if (!this.tracking_id) {
    let unique = false;
    while (!unique) {
      const newId = generateTrackingId();
      const existing = await mongoose.models.Order.findOne({ tracking_id: newId });
      if (!existing) {
        this.tracking_id = newId;
        unique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

