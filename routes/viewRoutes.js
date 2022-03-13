const express = require('express')

const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')

const router = express.Router()

router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/account', authController.protect, viewController.account)

router.post('/submit-user-data', authController.protect, viewController.submitUserData)

module.exports = router
