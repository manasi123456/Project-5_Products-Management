const userModel= require('../models/userModel');
// const mongoose = require('mongoose');
const validation = require('../validator/validator');
// const jwt = require('jsonwebtoken');
const aws = require('aws-sdk')
const bcrypt= require('bcrypt')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})


const registerUser= async function(req, res){
    try{
    let data= req.body;

    let {fname,lname,email,phone,password,address}=data

    if (!validation.validBody(data)) {
        return res.status(400).send({status:false,msg:"please provide details"})
    }

    if(!validation.isValid(fname)){
        return res.status(400).send({status:false,msg:"fname is required"})
    }
    if(!validation.isValid(lname)){
        return res.status(400).send({status:false,msg:"lname is required"})
    }
    if(!validation.isValid(email)){
        return res.status(400).send({status:false,msg:"email is required"})
    }
    if (!validation.emailValid(email)) {
        return res.status(400).send({status:false,msg:"Please enter Valid Email"})
    }

    let files= req.files
    if(files && files.length>0){
       
        let uploadedFileURL= await validation.uploadFile( files[0] )
        data.profileImage=uploadedFileURL
    }
    else{
        res.status(400).send({ msg: "file required" })
    }

    if (!validation.isValid(phone)) {
        return res.status(400).send({status:false,msg:"phone number is required"})
    }
    if(!validation.mobileValid(phone)){
        return res.status(400).send({status:false,msg:"please enter valid mobile number"})
    }
    if (!validation.isValid(password)) {
        return res.status(400).send({status:false,msg:"password is required"})
    }
    if (!(password.length >= 8 && password.length <= 15)) {
        return res.status(400).send({ status: false, message: "Password minimum length is 8 and maximum is 15." })
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    if(!validation.isValid(address)){
        return res.status(400).send({ status: false, message: "address is required" })
    }
  

    if(!address.shipping){
        return res.status(400).send({ status: false, message: "shipping address is required" })
    }
 
    let shipping= address.shipping

    const {street,city,pincode}=shipping

    if(!validation.isValid(street)){
        return res.status(400).send({ status: false, message: "street is required" })
    }
    if (!validation.isValid(city)) {
        return res.status(400).send({ status: false, message: "city is required" })
    }
    if(!validation.isValid(pincode)){
        return res.status(400).send({ status: false, message: "pincode is required" })
    }
    if(!/^\d{6}/.test(pincode)){
        return res.status(400).send({ status: false, message: "please enter 6 digit pincode" })
    }

    if(!address.billing){
        return res.status(400).send({ status: false, message: "billing address is required" })
    }
    if(!validation.isValid(street)){
        return res.status(400).send({ status: false, message: "street is required" })
    }
    if (!validation.isValid(city)) {
        return res.status(400).send({ status: false, message: "city is required" })
    }
    if(!validation.isValid(pincode)){
        return res.status(400).send({ status: false, message: "pincode is required" })
    }
    if(!/^\d{6}/.test(pincode)){
        return res.status(400).send({ status: false, message: "please enter 6 digit pincode" })
    }


    let userDetail= await userModel.create(data);
    return res.status(201).send({status:true,msg:"User created successfully", data:userDetail})

    }
    catch(err){
        return res.status(500).send({status:false ,error:err.message})
    }
 
}

module.exports={registerUser}