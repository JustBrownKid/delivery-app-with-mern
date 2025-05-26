const mongoose = require('mongoose');
const City = require('../models/City');
const State = require('../models/State');
const express = require('express');

const router = express.Router();

/**
 * GET all cities with their associated state names
 */
router.get('/', async (req, res) => {
    try {
        const cities = await City.find().populate('state_id', 'name'); // assumes 'stateId' field exists in City schema
        if (cities.length === 0) {
            return res.status(404).send({ message: "No cities found" });
        }
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/**
 * POST create a new city linked to a state
 */
router.post('/', async (req, res) => {
    try {
        const { name, short ,state_id } = req.body;
        if (!name || !state_id) {
            return res.status(400).send({ message: "City name and stateId are required" });
        }

        const state = await State.findById(req.body.state_id);
        if (!state) {
            return res.status(404).send({ message: "State not found" });
        }

        const city = await City.create({
            name,
            short,
            state_id
        });

        res.status(201).json(city);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
