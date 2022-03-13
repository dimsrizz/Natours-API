const express = require('express')

const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

router.use('/:tourID/reviews', reviewRouter)

router.route('/5-cheap-tours').get(tourController.aliasTopTours, tourController.getAllTour)
router.route('/tours-stats').get(tourController.getTourStats)
router
  .route('/monthly-plan/:year')
  .get(authController.protect, authController.restrict('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
  .route('/')
  .get(tourController.getAllTour)
  .post(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.createTour)
router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.updateTour)
  .delete(authController.protect, authController.restrict('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router
