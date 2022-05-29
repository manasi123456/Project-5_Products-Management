const validation = require('../validator/validator')
const cartModel  = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel =require('../models/userModel')

const createCart = async function(req, res){
    try{
    let data = req.body;
    let userId= req.params.userId;
    let cartId = req.body.cartId;
 let {productId , quantity , totalPrice, totalItems}= data
 if(!userId){
     return res.send({message:"enter user id"})
 }
    if(!validation.validObjectId(userId)){
        return res.status(400).send({status:false , message:"please enter valid userid"})
    }
    let user = await userModel.findById({_id:userId})
    if(!user){
        return res.status(404).send({status:false,message:"No user found"})
    }
    // if(userId != req.userid){
    //     return res.status(403).send({status:false,message:"unauthorized user, not allowed to create cart in another user account"})
    // }
    if(!validation.validBody(data)){
        return res.status(400).send({status:false , message:"please enter data to create a cart"})
    }

  

    if(!validation.isValid(productId) || !validation.validObjectId(productId)){
        return res.status(400).send({status:false,message:"enter valid product Id"})
    }
    // find product in db
    let product = await productModel.findOne({_id:productId , isDeleted:false})
    if(!product){
        return res.status(404).send({status:false,message:"no product found"})
    }
   

    
    // if(!cartId){
      
        let existing = await cartModel.findOne({userId:userId}).select({_id:1})
        let existingCart = await cartModel.findOne({_id:existing})
  
        let cart = await cartModel.findOne({_id:cartId})
        
        if(cart || existingCart){
            if(cart){
            let cartData ={};         
            let existingProductIndex = cart.items.findIndex(p=> p.productId ==productId)  
           
            //same product in cart
            if(existingProductIndex >= 0){
                let existingProduct = cart.items[existingProductIndex]
                existingProduct.quantity +=  1
              
                cartData.items = cart.items    // saving existingProduct after adding quantity 
                console.log("hirrrrrri")
                // updating price and items in cart
                cartData.totalPrice = cart.totalPrice+product.price
                cartData.totalItems= cart.items.length;
                const updatedCart = await cartModel.findOneAndUpdate({_id:cartId},cartData,{new:true})
                return res.status(210).send({message:"successfull",data:updatedCart})
            }
            }
            if(existingCart){
            let existingCartitem = existingCart.items.findIndex(p=> p.productId ==productId)  

            if(existingCartitem>=0){
                let cartData ={};  
                let existingProduct = existingCart.items[existingCartitem]
                existingProduct.quantity +=  1
                console.log("hiifff")
                cartData.items = existingCart.items    // saving existingProduct after adding quantity 
                // updating price and items in cart
                cartData.totalPrice = existingCart.totalPrice+product.price
                cartData.totalItems= existingCart.items.length;
                const updatedCart = await cartModel.findOneAndUpdate({userId:userId},cartData,{new:true})
                return res.status(210).send({message:"successfull",data:updatedCart})

            }
            }
               //diifernt product to add in cart
            else{
                    let arr= cart.items
              
                    list={productId:productId,quantity:1}
                    arr.push(list)
                  
                    cartData.items = arr
                    cartData.quantity = quantity;
                    cartData.totalPrice = cart.totalPrice + product.price;
                    cartData.totalItems = cart.items.length
                    const updatedCart = await cartModel.findOneAndUpdate({_id:cartId},cartData,{new:true})
                    return res.status(211).send({message:"successfull",data:updatedCart})
                   }
            }    
    
    else{
        let productid = product._id

             let arr =[]
            list={productId:productid,quantity:1}
            arr.push(list)
        
            totalPrice= product.price
            totalItems = 1
    
        let products ={userId,items:arr,totalPrice,totalItems}
        let  cart = await cartModel.create(products)
        return res.status(213).send({message:"successfull",data:cart})
    }
}
catch(err){
    return res.send({errror:err.message})
}

}

// const createCart = async function (req, res) {
//     try {
//         let data = req.body
//         if(!validation.validBody(req.body)) return res.status(400).send({status : false, msg : "Invalid or Empty Body"})
//         if (req.body.cartId == undefined) {
//             if (req.body.productId) {
//                 if (!validation.validObjectId(req.body.productId)) return res.status(400).send({ status: false, msg: "Invalid productId" })
//                 let validProdId = await productModel.findOne({ _id: data.productId, isDeleted: false })
//                 if (!validProdId) return res.status(400).send({ status: false, msg: "ProductId Invalid or Product Deleted" })
//                 if (!validation.validObjectId(req.params.userId)) return res.status(400).send({ status: false, msg: "UserID in params not Valid" })

//                 let cartExists = await cartModel.findOne({userId : req.params.userId})
//                 if(cartExists) return res.status(400).send({status : false, msg : "Cart Exists for this user, Please enter the cartId"})

//                 data.items = []

                
//                 if (data?.quantity) {
//                     if (!validation.isValid(data.quantity)) return res.status(400).send({ status: false, msg: "quantity field Invalid" })
//                     if (!/^[0-9]+$/.test(data.quantity)) return res.status(400).send({ status: false, msg: "quantity field Invalid" })
//                     data.quantity = Number(data.quantity)

//                 }
//                 data.items.push({ productId: data.productId, quantity: data.quantity ?? 1 })

//                 let prodPrice = await productModel.findById({ _id: data.productId }).select({ _id: 0, price: 1 })

//                 data.totalPrice = prodPrice.price * (data.quantity ?? 1)
//                 data.totalItems = 1

//                 data.userId = req.params.userId

//                 let cartCreated = await cartModel.create(data)
//                 res.status(201).send({ status: true, data: cartCreated })
//             } else {
//                 return res.status(400).send({ status: false, msg: "Missing ProductId" })
//             }
//         }
//         else {
//             if (!validation.validObjectId(req.body.productId)) return res.status(400).send({ status: false, msg: "Invalid productId" })
//             let validProdId = await productModel.findOne({ _id: data.productId, isDeleted: false })
//             if (!validProdId) return res.status(400).send({ status: false, msg: "ProductId Invalid or Product Deleted" })
//             if (!validation.validObjectId(req.params.userId)) return res.status(400).send({ status: false, msg: "UserID in params not Valid" })
//             if(!validation.validObjectId(req.body.cartId)) return res.status(400).send({status : false, msg : "CartId is Invalid"})

//             if (data?.quantity) {
//                 if (!validation.isValid(data.quantity)) return res.status(400).send({ status: false, msg: "quantity field Invalid" })
//                 if (!/^[0-9]+$/.test(data.quantity)) return res.status(400).send({ status: false, msg: "quantity field Invalid" })
//                 data.quantity = Number(data.quantity)

//             }


//             let flag = 0
//             let cartExist = await cartModel.findById({ _id: data.cartId })
//             if (!cartExist) return res.status(400).send({ status: false, msg: "Cart does not exist" })

//             let cartDetails = await cartModel.findById({ _id: data.cartId })
//             for (let i = 0; i < cartDetails.items.length; i++) {
//                 if (cartDetails.items[i].productId?.toString() == data.productId) {
//                     flag = 1
//                     let prodPrice = await productModel.findById({ _id: data.productId }).select({ _id: 0, price: 1 })

//                     if (data?.quantity) data.quantity = Number(data.quantity)
//                     else data.quantity = 1
//                     data.totalPrice = data.quantity * prodPrice.price
//                     data.totalPrice += cartDetails.totalPrice
//                     let updateCart = await cartModel.findOneAndUpdate({ _id: data.cartId, 'items.productId': data.productId }, { $set: { totalPrice: data.totalPrice }, $inc: { 'items.$.quantity': data.quantity } }, { new: true })

//                     return res.status(200).send({ status: true, msg: updateCart })


//                 }
//             }
//             if (flag !== 1) {
//                 if (data?.quantity) data.quantity = Number(data.quantity)
//                 let prodPrice = await productModel.findById({ _id: data.productId }).select({ _id: 0, price: 1 })
//                 data.totalPrice = prodPrice.price * (data.quantity ?? 1)
//                 data.totalPrice += cartDetails.totalPrice
//                 let newProd = { productId: data.productId, quantity: data.quantity ?? 1 }
//                 let updateCart = await cartModel.findOneAndUpdate({ _id: data.cartId }, { $push: { items: newProd }, $inc: { totalItems: 1 }, $set: { totalPrice: data.totalPrice }, $inc : {totalItems : 1} }, { new: true })
//                 return res.status(200).send({ status: false, data: updateCart })
//             }



//         }


//     } catch (e) {
//         return res.status(500).send({ status: false, msg: e.message })
//     }
// }

const removeProduct = async function (req, res) {
    try {
        if(!validation.validBody(req.body)) return res.status(400).send({status : false, msg : "Bad req Body"})
        let userId = req.params.userId
        if (!validation.validObjectId(userId)) return res.status(400).send({ status: false, msg: "Bad ObjectId in params" })

        let userExist = await userModel.findById({ _id: userId })
        if (!userExist) return res.status(400).send({ status: false, msg: "User Does Not Exist" })

        let { cartId, productId, removeProduct } = req.body

        if (!validation.isValid(cartId) || !validation.isValid(productId) || !validation.isValid(removeProduct)) return res.status(400).send({ status: false, msg: "Bad fields for request body, missing or Invalid fields" })

        if (!(removeProduct == '0' || removeProduct == '1'))
         return res.status(400).send({ status: false, msg: "Bad field for removeProduct" })
        removeProduct = Number(removeProduct)

        if (!validation.validObjectId(cartId))
        return res.status(400).send({ status: false, msg:"Bad ObjectId for cartId" })
        if (!validation.validObjectId(productId)) 
        return res.status(400).send({ status: false, msg:"Bad ObjectId for ProductId" })

        let cartExists = await cartModel.findById({ _id: cartId })
        if (!cartExists) return res.status(400).send({ status: false, msg: "Cart Does Not Exist" })

        let productExists = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExists) return res.status(400).send({ status: false, msg: "Prduct Does not Exists" })

        if(cartExists.userId.toString() !== req.params.userId) return res.status(400).send({status : false, msg : "Params userId does not match with the userId inside of Cart"})

        if (removeProduct == 0) {
            let quantity; let totalPrice;
            let itemsArr = await cartModel.findById({ _id: cartId })
            if (itemsArr) {
                for (let i = 0; i < cartExists.items.length; i++) {
                    if (cartExists.items[i].productId.toString() == productId) {
                        quantity = cartExists.items[i].quantity
                    }
                }
                totalPrice = cartExists.totalPrice
                totalPrice -= (productExists.price * quantity)
                let newCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $set: { totalPrice: totalPrice }, $inc: { totalItems: -1 } }, { new: true })
                return res.status(200).send({ status: true, data: newCart })
            }
        }
        else if (removeProduct == 1) {
            
            let prodPrice = productExists.price;
            let quantity;
            let totalPrice = cartExists.totalPrice
            totalPrice -= prodPrice
            for(let i = 0;i < cartExists.items.length; i++){
                if (cartExists.items[i].productId.toString() == productId) {
                    quantity = cartExists.items[i].quantity
                }
            }
            
            if(quantity > 1){
                let newCart = await cartModel.findOneAndUpdate({_id : cartId, 'items.productId' : productId}, {$set : {totalPrice : totalPrice}, $inc : {'items.$.quantity' : -1}},{new : true})
                return res.status(200).send({status:true, data : newCart})
            }
            else if(quantity == 1){
                totalPrice = cartExists.totalPrice
                totalPrice -= (productExists.price * quantity)
                let newCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $set: { totalPrice: totalPrice }, $inc: { totalItems: -1 } }, { new: true })
                return res.status(200).send({ status: true, data: newCart })
            }

        }



    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const getCartByUserId = async function (req, res) {
    try {

        let userId = req.params.userId;
        //let userIdFromToken = req.userId
        //----------------------------------------------Validation Starts---------------------------------------//
        // validating userid from params
        if (!validation.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter" });
        }
        if (!validation.validObjectId(userId)) {
            return res.status(400).send({ status: false, message: "UserId is Invalid" });
        }
        let user = await userModel.findById({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, msg: "User does't exist" });
        }
        let usercartid = await cartModel.findOne({ userId });
        if (!usercartid) {
            return res.status(404).send({ status: false, msg: "Cart does't exist" });
        }
        // if (user._id.toString() !== userIdFromToken) {
        //     res.status(403).send({ status: false, message: `Unauthorized access! info of owner doesn't match` });
        //     return
        // }
        return res.status(200).send({ status: true, data: usercartid })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error.message });
    }
}



const deleteCart = async function (req, res) {
    try {
        let user = req.params.userId
        if (!validation.validObjectId(user)) {
            return res.status(500).send({ status: false, message: "plesge enter valid objectId" })
        }
        let existUserId = await userModel.findById({ _id: user })
        if (!existUserId) {
            return res.status(404).send({ staus: false, message: "user does not exist" })
        }

        const userInCart = await cartModel.findOne({ userId: user })
        let cart = userInCart._id
        // console.log(cart)
        // return console.log(`cart ${cart}`)
        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart does't exist" })
        }
      
        const check = await cartModel.findOneAndUpdate({ _id: cart },{$set: {totalPrice: 0,totalItems:0,items:[]}}, { new: true })
      
        return res.status(200).send({status:true,message:"success"})
        

    }
    catch (err) {
        return res.status(500).send({ status: false, console: err.error })
    }
}

module.exports={createCart,removeProduct,getCartByUserId,deleteCart}





                //  let productid = product._id

                // totalPrice = parseInt((product.price*quantity))
                // if(productId===productId){
                //   let  cart = await cartModel.findOneAndUpdate({_id:cartId},{$set:{items:{productId:productId},totalPrice:totalPrice,$inc:{totalItems:1}}},{new:true})
                //   return res.send({message:"successfull",data:cart})
                // }
                // else {
                //     let additems = await cartModel.findOneAndUpdate({_id:cartId},{"$push":{items:{productId:productId}}}) 
                //     return res.send({message:"added",data:additems})
            
                //    }
            
            // let  cart = await cartModel.findOneAndUpdate({_id:cartId},{items:arr,totalPrice:totalPrice,$inc:{totalItems:1}},{new:true})
            // return res.send({message:"successfull",data:cart})