const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //  ALlow nested routes
    let filter
    if (req.params.tourID) filter = { tour: req.params.tourID }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
    const tours = await features.query

    res.status(200).json({
      message: 'success',
      results: tours.length,
      data: {
        tours,
      },
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)

    if (popOptions) query = query.populate(popOptions)

    const doc = await query

    if (!doc) {
      return next(new AppError('No tour found by that id', 404))
    }

    res.status(200).json({
      message: 'success',
      data: {
        doc,
      },
    })
  })

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError(`No document found by that id`, 404))
    }

    res.status(204).json({
      message: `Success deleted`,
    })
  })

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })

    if (!doc) {
      return next(new AppError('No document found by that id', 404))
    }

    res.status(200).json({
      message: 'Success',
      data: {
        doc,
      },
    })
  })

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)

    res.status(200).json({
      message: 'Success',
      newDoc,
    })
  })
