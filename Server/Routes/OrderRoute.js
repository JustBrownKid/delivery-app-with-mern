const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Shipper = require('../models/Shipper');
const State = require('../models/State');
const City = require('../models/City');  
const Order = require('../models/Order');  


router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('shipper_id', 'name phone id_shipper address' )
            .populate('state_id' , 'name')
            .populate('city_id' , 'name short')
             .sort({ createdAt: -1 });  ;
            res.status(200).json(orders);   
        
    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.get('/shipper/:id', async (req, res) => {
  try {
    const shipperId = req.params.id;
    const shipper = await Shipper.findOne({shipper_id : shipperId});
    if(!shipper){
        res.status(200).json({con:true , message : 'Shipper Not Found'})
    }
    const orders = await Order.find({shipper_id : shipper._id})
      .populate('shipper_id',)
      .populate('state_id',)
      .populate('city_id',)
      .sort({ createdAt: -1 });

    res.status(200).json({ shipperId, orders });
  } catch (error) {
    res.status(500).send(error.message);  
  }
});


router.post('/', async (req, res) => {
     try {
    const orders = req.body;
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