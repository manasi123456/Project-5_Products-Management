const express = require("express");
const userController= require('../controller/userController')
const productController =require('../controller/productController')
const auth= require('../middleware/auth')
const router = express.Router()

router.post('/register', userController.registerUser)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile',userController.getDetails)

router.put('/user/:userId/profile',auth.auth,userController.updateDetails)




router.post('/products', productController.addProducts)
router.get('/products', productController.getdata)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProducts)
router.delete('/products/:productId', productController.deleteProduct)
module.exports = router;