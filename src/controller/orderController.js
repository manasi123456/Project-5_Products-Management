const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const validation = require('../validator/validator')

const createOrder = async function (req, res) {
    let userId = req.params.userId
    let cancellable = req.body.cancellable
    if (!validation.validObjectId(userId)) {
        return res.status(400).send({ status: false, message: "userId is invalid" })
    }
    let user = await userModel.findOne({ _id: userId })
    if (!user) {
        return res.status(404).send({ status: false, message: "no user found" })
    }
    if (userId != req.userid) {
        return res.status(403).send({ status: false, message: "unauthorized user" })
    }
    let cart = await cartModel.findOne({ userId: userId })
    if (!cart) {
        return res.status(404).send({ status: false, message: "no cart found" })
    }
    let arrProductQuantity = [];
    let total = 0;
    let obj = {}
    for (let i = 0; i < cart.items.length; i++) {
        arrProductQuantity[i] = cart.items[i].quantity
    }
    if (arrProductQuantity.length == 0) {
        return res.send("cart is empty")
    }
    for (let i in arrProductQuantity) {
        total += arrProductQuantity[i];
    }
    obj.items = cart.items
    obj.totalPrice = cart.totalPrice
    obj.totalItems = cart.totalItems
    obj.totalQuantity = total
    obj.userId = userId
    obj.cancellable = cancellable
    let order = await orderModel.create(obj)
    await cartModel.findOneAndUpdate({ userId: userId }, { $set: { totalPrice: 0, totalItems: 0, items: [] } }, { new: true })
    return res.status(201).send({ status: true, message: "success", data: order })
}


const updateOrder = async function (req, res) {
    let userId = req.params.userId
    let status = req.body.status
    if (!validation.validObjectId(userId)) {
        return res.status(400).send({ status: false, message: "invalid user ObjectId" })
    }
    let user = await userModel.findById({ _id: userId })
    if (!user) {
        return res.status(404).send({ status: false, message: "no user found" })
    }
    if(userId != req.userid){
        return res.status(403).send({status:false,message:" unautorized user"})
    }
    let orderStatus = await orderModel.findOne({ userId })
    if (!orderStatus) {
        return res.status(404).send({ status: false, message: "no order for this user" })
    }
    if (!validation.isValid(status)) {
        return res.status(400).send({ status: false, message: "enter status to update" })
    }
    let cancellableOrder = await orderModel.findOne({ userId }).select({ cancellable: 1, _id: 0 })
    if (cancellableOrder.cancellable == true) {
        if (!(['pending', 'completed', 'cancled'].includes(status))) {
            return res.status(400).send({ status: false, message: "status can be pending|completed , you cannot cancel this order " })
        }
    }
    if (!(['pending', 'completed'].includes(status))) {
        return res.status(400).send({ status: false, message: 'order can not be cancled' })
    }
    let updatedOrder = await orderModel.findOneAndUpdate({ userId }, { $set: { status} }, { new: true })
    return res.status(200).send({ status: true, message: "success", data: updatedOrder })
}

module.exports = { createOrder, updateOrder }