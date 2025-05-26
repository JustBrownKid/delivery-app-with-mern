const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stateRoutes = require('./Routes/State');
const cityRoutes = require('./Routes/City');
const userRoutes = require('./Routes/UserRout');
const nodemailer = require('nodemailer');
require('dotenv').config();



const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pozt', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pozt', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});