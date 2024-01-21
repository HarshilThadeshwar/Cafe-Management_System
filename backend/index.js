const express = require("express");
var cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const pool = require("./connection");
const useRoute = require('./routes/user');
const categoryRoute = require('./routes/category');
const productRoute = require('./routes/product');
const billRoute = require('./routes/bill');
const dashboardRoute = require('./routes/dashboard');

app.use(cors());
app.use(express.json());
app.use('/user', useRoute);
app.use('/category',categoryRoute);
app.use('/product', productRoute);
app.use('/bill', billRoute);
app.use('/dashboard', dashboardRoute);
app.use(bodyParser.json());



module.exports = app;
