const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
// const authController = require('./authController')

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find()

  res.status(200).render('overview', {
    title: 'Get all tours',
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  //  get data by slug

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  })

  if (!tour) next('Error no tour found', 404)

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  })
})

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  })
})

exports.account = catchAsync(async (req, res, next) => {
  const { user } = req

  res.status(200).render('account', {
    title: 'Account',
    user,
  })
})

exports.submitUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body

  const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true })

  res.status(200).render('account', {
    title: 'Account',
    user: updatedUser,
  })
})
