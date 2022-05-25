const validation = require('../validator/validator');
const productModel=require('../models/productModel')

const addProducts = async function(req, res){
    try{
        let data = req.body

        let {title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}=data
        if (!validation.validBody(data)) 
        return res.status(400).send({ status: false, msg: 'Enter details of products.' })

        let files = req.files
        if (files && files.length > 0) {

            let uploadedFileURL = await validation.uploadFile(files[0])
            data.productImage = uploadedFileURL
        }
        else {
          return  res.status(400).send({ msg: "file required" })
        }
        
        if(!validation.isValid(title))
         return res.status(400).send({status : false, msg : "Enter Title"})
        let usedTille = await productModel.findOne({title})
        if(usedTille)
         return res.status(400).send({status : false , msg : "Title already Present"})

        if(!validation.isValid(description)) 
        return res.status(400).send({status : false, msg : "Enter description"})
       
        if(price < 0 || !validation.isValid(price) || !/\d/.test(price))
         return res.status(400).send({status : false, msg : "enter Price"})

        if(currencyId != "INR") 
        return res.status(400).send({status : false, msg : "wrong CurrencyId"})

        if(currencyFormat != '₹')
        return res.status(400).send({status : false, msg : "wrong CurrencyFormat"})

        if(availableSizes <= 0 || !validation.isValid(availableSizes)) 
        return res.status(400).send({status : false, msg : "Add Sizes"})

        if(installments < 0)
         return res.status(400).send({status : false, msg : "Bad Installments Field"})


        let created = await productModel.create(data)
        return res.status(201).send({status :true, msg : "Success", data : created})


    }catch(err){
        res.status(500).send({status :false, msg : err.message})
    }
}





// const getProducts= async function(req,res){
//     try {
//         let filter=req.query
//         if(!filter){
//         let allProducts= await productModel.find({isDeleted:true})
//         if(!allProducts){
//             return res.status(400).send({status:false,msg:"no products found"})
//         }
//         return res.status(200).send({status:true,msg:"Success",data:allProducts})
//     }
//     let {size,name,priceGreaterThan,priceLessThan}=filter


//     } catch (error) {
        
//     }
// }

const getProductById= async function(req,res){
    try {
        let id= req.params.productId

        if(!validation.validObjectId(id)){
            return res.status(400).send({status:false,msg:"invalid productId"})
        }

        let products= await productModel.findOne({_id:id, isDeleted:false})
        if(!products){
            return res.status(404).send({status:false,msg:"product not found"})
        }
        return res.status(200).send({status:true,msg:"Success",data:products})


    } catch (err) {
        return res.status(500).send({status:false, error:err.message})
    }
}



const updateProducts = async function(req, res){
    let id = req.params.productId
    let data  = req.body
    let files = req.files
    if(!validation.validObjectId(id)){
        return res.status(400).send({status:false,msg:"not a valid onjectId"})
    }
    let product= await productModel.findOne({_id:id,isDeleted:false})
    if (!product) {
        return res.status(404).send({status:false,msg:"no product found with this id"})
    }
    if (!validation.validBody(data)) {
        return res.status(400).send({status:false,msg:"please provide data to update"})
    }
    if (files && files.length > 0) {

        let uploadedFileURL = await validation.uploadFile(files[0])
        data.productImage = uploadedFileURL
    }
    let updateData = await productModel.findByIdAndUpdate({_id:id},data,{new:true})
    return res.status(200).send({status:true,message:"successfully updates",data:updateData})

}



module.exports = {addProducts,getProductById,updateProducts}


