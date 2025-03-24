const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const message = `Duplicate field value : ${error.keyValue.name}, Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  // const errors = Object.values(error.errors).map((element) => element.message);

  // const message = `Invalid Input data. ${errors.join('. ')}`;
  const message = error.message;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  // operational, trusted error -> send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  // programming or other unexpected errors, dont leak error details
  else {
    console.error('ERROR 🔥🔥', error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (error, req, res, next) => {
  error.status = error.status || 'fail';
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let newError = { ...error };

    if (error.name === 'CastError') newError = handleCastErrorDB(newError);
    if (error.code === 11000) newError = handleDuplicateFieldsDB(newError);
    if (error.name == 'ValidationError') {
      newError.message = error.message;
      newError = handleValidationErrorDB(newError);
    }
    if (error.name === 'JsonWebTokenError') newError = handleJWTError();
    if (error.name === 'TokenExpiredError') newError = handleJWTExpiredError();
    sendErrorProd(newError, res);
  }
};
