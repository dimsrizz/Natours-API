const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

// local module
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const viewRouter = require('./routes/viewRoutes')
const reviewRouter = require('./routes/reviewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// Global Middleware
// app.use(helmet())

// Development Environment
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Limit request to api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests, please try again in one hour!',
})

app.use('/api', limiter)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization
app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  })
)

// Views

// app.use((req, res, next) => {
//   // console.log(req.cookies)

//   next()
// })

// Route
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

// Global error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} from our server`, 404))
})

app.use(globalErrorHandler)

module.exports = app
