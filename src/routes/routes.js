const express = require("express");
const userController= require('../controller/userController')
const router = express.Router()

router.post('/register', userController.registerUser)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile',userController.getDetails)

router.put('/user/:userId/profile',userController.updateDetails)
module.exports = router;