const express = require('express')

const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')

const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')

const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')

// local module
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const viewRouter = require('./routes/viewRoutes')
const reviewRouter = require('./routes/reviewRoutes')

const app = express()

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests, please try again in one hour!',
})

// Swagger docs
const swaggerDocs = yaml.load('./api-docs.yaml')

// Global Middleware
app.use(cors())

// View Engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// Security package
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  })
)

// Limit request to api
app.use('/api', limiter)

// Development Environment
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Route
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Global error handling
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} from our server`, 404))
})

app.use(globalErrorHandler)

module.exports = app
