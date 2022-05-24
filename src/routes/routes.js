const express = require("express");
const userController= require('../controller/userController')
const auth= require("../middleware/auth")
const router = express.Router()

router.post('/register', userController.registerUser)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile',auth.auth,userController.getDetails)

module.exports = router;