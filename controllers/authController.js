const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = id =>
  jwt.sign({ id: id }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  })

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id)

  const cookieOptions = {
    expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  user.password = undefined

  res.status(statusCode).send({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  })

  createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) return next(new AppError('please input valid email or password', 400))

  const user = await User.findOne({ email: email }).select('+password')
  if (!user) return next(new AppError('Invalid email or password, cant find user', 401))
  const correct = await user.comparePassword(password, user.password)
  if (!correct) return next(new AppError('Incorrect email or password', 401))

  createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expire: Date.now() + 10 * 1000,
    httpOnly: true,
  })

  res.status(200).json({ message: 'Success' })
}

exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) token = req.cookies.jwt

  if (!token) return next(new AppError('You are not allowed to access this, please login first.', 401))

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_TOKEN)

  const freshUser = await User.findById(decoded.id)
  if (!freshUser) return next(new AppError('This token is not available', 401))

  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('The user has already changed their password', 401))
  }

  req.user = freshUser

  next()
})

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_ACCESS_TOKEN)

      const currentUser = await User.findById(decoded.id)
      if (!currentUser) return next()

      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError())
      }

      res.locals.user = currentUser
      return next()
    }
    next()
  } catch (err) {
    return next()
  }
}

exports.restrict =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You do not have permission to access this, access is restricted', 403))

    next()
  }

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(new AppError('There is no user with that email address', 404))

  const resetToken = user.createPasswordResetToken()

  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? send patch request to ${resetUrl} with your new password and the confirmed password`

  try {
    sendEmail({
      email: user.email,
      subject: 'Your password reset token (only valid 10 min)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Success send token to your email',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error sending to your email,try again later', 500))
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

  if (!user) return next(new AppError('User not found, your token is invalid or expired', 400))

  if (req.body.password !== req.body.passwordConfirm)
    return next(new AppError('your confirmation password is incorrect', 400))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  user.save()

  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!user.comparePassword(req.body.passwordCurrent, user.password))
    return next(new AppError('Your current password is incorrect', 401))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  createSendToken(user, 200, res)
})
