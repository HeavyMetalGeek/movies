const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const movieRoutes = require('./api/routes/movies');

const app = express();

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true
});

// Handlebars
app.engine('handlebars', exphbs({
	layoutsDir   : path.join(__dirname, 'client/views/layouts'),
  defaultLayout: 'main',
  helpers      : path.join(__dirname, 'client/views/helpers'),
  partialsDir  : [
      path.join(__dirname, 'client/views/partials')
  ]
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'client/views'))

// Body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Morgan
app.use(morgan('dev'));

// Method-override
app.use(methodOverride('_method'));

// Static folder
app.use(express.static(path.join(__dirname, 'client')));

// Flash
app.use(flash());

// Express-session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// CORS Fix
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Use routes
app.use('/movies', movieRoutes);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;