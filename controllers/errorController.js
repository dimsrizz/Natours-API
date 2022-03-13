const AppError = require('../utils/appError')

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    })
  } else {
    console.log(err)
    res.status(404).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    })
  }
}

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    console.error('ERROR OCCURED!!!', err)

    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    })
  }
}

const handleErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicationErrorDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationError = err => {
  const mess = Object.values(err.errors).map(obj => obj.message)

  const message = `Invalid input data: ${mess.join(' , ')}`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token please try to login again!', 401)
const handleTokenExpiredError = () => new AppError('Your token has expired, please login again!', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err }

    if (err.name === 'CastError') error = handleErrorDB(err)
    if (err.code === 11000) error = handleDuplicationErrorDB(err)
    if (err.name === 'ValidationError') error = handleValidationError(err)
    if (err.name === 'JsonWebTokenError') error = handleJWTError()
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError()

    sendErrorProd(error, req, res)
  }

  sendErrorDev(err, req, res)
}
