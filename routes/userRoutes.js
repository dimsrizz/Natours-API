const express = require('express')

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// protect all routes afters
router.use(authController.protect)

router.patch('/updateMyPassword', authController.updatePassword)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)
router.route('/me').get(userController.getMe, userController.getUser)

// restrict to admin only
router.use(authController.restrict('admin'))

router.route('/').get(userController.getAllUser).post(userController.createUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.restrict('admin'), userController.updateUser)
  .delete(authController.restrict('admin'), userController.deleteUser)

module.exports = router
