const userModel = require('../models/userModel');
const validation = require('../validator/validator');
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})



// ====================================================userRegistration===========================================


const registerUser = async function (req, res) {
    try {
        let data = req.body;

        let { fname, lname, email, phone, password, address } = data

        if (!validation.validBody(data)) {
            return res.status(400).send({ status: false, message: "please provide details" })
        }

        if (!validation.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }
        if (!validation.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" })
        }
        // email
        if (!validation.isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }
        if (!validation.emailValid(email)) {
            return res.status(400).send({ status: false, message: "Please enter Valid Email" })
        }
        let usedEmail = await userModel.findOne({ email })
        if (usedEmail) {
            return res.status(400).send({ status: false, message: "email already exist" })
        }

        // image upload
        let files = req.files
        if (files && files.length > 0) {

            let uploadedFileURL = await validation.uploadFile(files[0])
            data.profileImage = uploadedFileURL
        }
        else {
            res.status(400).send({ msmessageg: "file required" })
        }
        // phone
        if (!validation.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }
        if (!validation.mobileValid(phone)) {
            return res.status(400).send({ status: false, message: "please enter valid mobile number" })
        }
        let usedPhone = await userModel.findOne({ phone })
        if (usedPhone) {
            return res.status(400).send({ status: false, message: "phone already exist" })
        }
        // password
        if (!validation.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password minimum length is 8 and maximum is 15." })
        }

        if (!validation.isValid(address)) {
            return res.status(400).send({ status: false, message: "address is required" })
        }

        // shipping addresss
        if (!address.shipping) {
            return res.status(400).send({ status: false, message: "shipping address is required" })
        }
        let shipping = address.shipping

        const { street, city, pincode } = shipping

        if (!validation.isValid(street)) {
            return res.status(400).send({ status: false, message: "street is required" })
        }
        if (!validation.isValid(city)) {
            return res.status(400).send({ status: false, message: "city is required" })
        }
        if (!validation.isValid(pincode)) {
            return res.status(400).send({ status: false, message: "pincode is required" })
        }
        if (!/^\d{6}/.test(pincode)) {
            return res.status(400).send({ status: false, message: "please enter 6 digit pincode" })
        }


        // billing address
        if (!address.billing) {
            return res.status(400).send({ status: false, message: "billing address is required" })
        }
        if (!validation.isValid(street)) {
            return res.status(400).send({ status: false, message: "street is required" })
        }
        if (!validation.isValid(city)) {
            return res.status(400).send({ status: false, message: "city is required" })
        }
        if (!validation.isValid(pincode)) {
            return res.status(400).send({ status: false, message: "pincode is required" })
        }
        if (!/^\d{6}/.test(pincode)) {
            return res.status(400).send({ status: false, message: "please enter 6 digit pincode" })
        }

        let userDetail = await userModel.create(data);
        return res.status(201).send({ status: true, message: "User created successfully", data: userDetail })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}

// ==================================userLogin================================================

const userLogin = async function (req, res) {
    try {
        let data = req.body;
        if (!validation.validBody(data)) {
            return res.status(400).send({ status: false, message: "please provide details" })
        }
        const { email, password } = data;
        if (!validation.isValid(email)) {
            return res.status(400).send({ status: false, message: "please provide email" })
        }
        let details = await userModel.findOne({ email })
        if (!details) {
            return res.status(401).send({ status: false, message: "provide correct email" })
        }
        let id = details._id
        if (!validation.isValid(password)) {
            return res.status(400).send({ status: false, message: "please provide password" })
        }

        const validPassword = await bcrypt.compare(data.password, details.password);
        if (!validPassword) {
            return res.status(401).json({ message: "inValid password" });
        }

        let token = jwt.sign({ userId: id.toString() }, 'uranium_project-5_group_30', { expiresIn: "60 min" })

        res.header("x-api-key", token);
        return res.status(200).send({ status: true, message: 'User login successfull', data: { id, token } });



    } catch (error) {
        return res.status(500).send({ status: false, err: error.message })
    }
}

module.exports = { registerUser, userLogin }