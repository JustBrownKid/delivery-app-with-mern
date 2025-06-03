const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Shipper = require('../models/Shipper');
const State = require('../models/State');   // Import your State model
const City = require('../models/City');     // Import your City model

// Get all shippers
router.get('/', async (req, res) => {
  try {
    const shippers = await Shipper.find()
      .populate('state_id')
      .populate('city_id');

    const formattedShippers = shippers.map(shipper => ({
      id: shipper._id,
      shipper_id: shipper.id_shipper,
      name: shipper.name,
      phone: shipper.phone,
      email: shipper.email,
      address: shipper.address,
      state: shipper.state_id?.name || null,
      city: shipper.city_id?.name || null
    }));

    res.status(200).json(formattedShippers);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.get('/:id', async (req, res) => {
  try {
    const shipperId = req.params.id;
    const shipper = await Shipper.findOne({id_shipper: shipperId});
    if (!shipper) {
      return res.status(404).json({ error: 'Shipper not found' });
    }
    res.status(200).json(shipper);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Create a new shipper
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, state_id, city_id } = req.body;
    if (!name || !email || !phone || !address || !state_id || !city_id) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(state_id)) {
      return res.status(400).json({ error: 'Invalid state_id format.' });
    }
    const state = await State.findById(state_id);
    if (!state) {
      return res.status(404).json({ error: 'State not found.' });
    }
    if (!mongoose.Types.ObjectId.isValid(city_id)) {
      return res.status(400).json({ error: 'Invalid city_id format.' });
    }
    const city = await City.findById(city_id);
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }
    const shipper = await Shipper.create(req.body);
    res.status(201).json(shipper);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
