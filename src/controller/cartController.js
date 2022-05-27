const validation = require('../validator/validator')
const cartModel  = require('../models/cardModel')
const productModel = require('../models/productModel')
const userModel =require('../models/userModel')

const createCart = async function(req, res){
    let data = req.body;
    let userid= req.params.userId;
 let {productId,quantity}= data
    if(!validation.validObjectId(userid)){
        return res.status(400).send({status:false , message:"please enter valid userid"})
    }
    let user = await userModel.findById({_id:userid})
    if(!user){
        return res.status(404).send({status:false,message:"No user found"})
    }

    if(userid != req.userid){
        return res.status(403).send({status:false,message:"unauthorized user, not allowed to create cart in another user account"})
    }
    if(!validation.validBody(data)){
        return res.status(400).send({status:false , message:"please enter data to create a cart"})
    }
    if(!validation.isValid(productId) || !validation.validObjectId(productId)){
        return res.status(400).send({status:false,message:"enter valid product Id"})
    }
     let productid = await productModel.findOne({_id:productId})
    


}