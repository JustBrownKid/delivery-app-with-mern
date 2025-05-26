const mongoose = require('mongoose');
const express = require('express');

const State = require('../models/State');
const router = express.Router();

// http://localhost:3000/api/states

router.get('/' , async(req , res)=>{
     try {
          const states = await State.find();
          if(states.length === 0 ){
               res.status(200).send({message : "No state here"});
          }
          res.status(200).send(states);
     } catch (error) {
          res.status(500).send(error.message);
     }
});


router.post('/' ,async(req , res)=>{
     try {
          const data = req.body;
          if (!data.name) {
               res.status(500).send({message : "name requuire"});
          }
          await State.create(data);               
          res.status(200).send(data);

     } catch (error) {
          res.status(500).send(error.message);
     }
});




module.exports = router;