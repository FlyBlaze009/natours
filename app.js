const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

//used to serve static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware! 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// unhandled routes
app.all('*', (req, res, next) => {
  // const error = new Error(`Cannot find ${req.originalUrl} on the server!`);
  // error.status = 'fail';
  // error.statusCode = 404;

  next(new AppError(`Cannot find ${req.originalUrl} on the server!`, 404));
});

//whenever we pass an argument to the next function
//express automatically knows its an error

// global error handling middleware
// if middleware has 4 arguments automatically a error handler

app.use(globalErrorHandler);

module.exports = app;
