require('./config/config');  // instantiate configuration variable;
require('./global_functions');  // instantiate global functions;

console.log('Enviorment:', CONFIG.app);

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');

const v1 = require('./routes/v1');


const app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//Passport
app.use(passport.initialize());

//DATABASE
const models = require('./models');
models.sequelize.authenticate()
  .then(() => {
    console.log('Connected to SQL database:', CONFIG.db_name);
  })
  .catch(error => {
    console.log('unable to connect to SQL database:', CONFIG.db_name, error);
  });
if (CONFIG.app === 'dev') {
  models.sequelize.sync(); // create tables if they do not already exist
  // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
  // Set to true if you need the website to include cookies in the request sent
  // to the API (if you use session)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// Use the v1 for url
app.use('/v1', v1);

app.use('/', function (req, res) {
  res.statusCode = 200; //send the appropriate status code
  res.json({status: 'success', message: 'Weight loss Pending API', data: {}})
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
