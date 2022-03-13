const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(authController.restrict('user'), reviewController.setTourUserID, reviewController.createReview)

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(authController.restrict('user', 'admin'), reviewController.updateReview)
  .delete(authController.restrict('user', 'admin'), reviewController.deleteReview)

module.exports = router
