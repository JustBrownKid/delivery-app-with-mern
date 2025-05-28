const mongoose = require('mongoose');

const shipperSchema = new mongoose.Schema({
  shiper_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
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
});

// Function to generate a 6-digit ID starting with 58
function generateShiperId() {
  const randomPart = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
  return `58${randomPart}`;
}

// Pre-save hook to generate shiper_id
shipperSchema.pre('validate', async function (next) {
  if (!this.shiper_id) {
    let unique = false;
    while (!unique) {
      const newId = generateShiperId();
      const existing = await mongoose.models.Shipper.findOne({ shiper_id: newId });
      if (!existing) {
        this.shiper_id = newId;
        unique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Shipper', shipperSchema);
