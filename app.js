const path = require('path');

const express = require('express'); 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/user');

const app = express();


app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/content', contentRoutes);
app.use('/user', userRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'clusterConnection'
  )
  .then(result => {
    console.log('connected');
    app.listen(8080);
  })
  .catch(err => console.log(err));
