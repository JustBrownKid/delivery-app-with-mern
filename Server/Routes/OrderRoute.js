const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Shipper = require('../models/Shipper');
const State = require('../models/State');
const City = require('../models/City');  
const Order = require('../models/Order');  

// Get all shippers
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('shipper_id')
            .populate('state_id')
            .populate('city_id');
            res.status(200).json(orders);   
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.post('/', async (req, res) => {
     try {
    const orders = req.body;  // expecting array of order objects
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Expected an array of orders' });
    }

    // Validate and create orders
    const createdOrders = await Order.insertMany(orders);
    res.status(201).json(createdOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;