const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./factoryHandler')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })

  return newObj
}

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: 'Error',
    message: 'Please use /signup route instead',
  })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('Cant change password in this route, please use /updateMyPassword instead'))

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj(req.body, 'name', 'email'), {
    new: true,
    runValidators: true,
  })

  console.log(updatedUser)

  res.status(200).json({
    status: 'success',
    updatedUser,
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id

  next()
}

exports.getAllUser = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
