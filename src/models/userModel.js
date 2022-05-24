const mongoose = require('mongoose');
const bcrypt= require('bcrypt')
const userSchema = new mongoose.Schema({
    fname:{type:String, required:true},
    lname:{type:String , required:true},
    email:{
        type:String,
        required:true,
        unique:true
    },
    profileImage:{
        type:String,
        // required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength: 8,
        maxlength:15,
     
    },
    address:{
        shipping:{
            street:{type:String, required:true },
            city:{type:String, required:true},
            pincode:{type:String, required:true}
        },
        billing:{
            street:{type:String, required:true },
            city:{type:String, required:true},
            pincode:{type:String, required:true}
        }
    }

},{timestamps:true})
userSchema.pre("save", async function (next) {
    console.log("bcrypt")
    if (this.isModified('password')) {
        this.password=await bcrypt.hash(this.password,12)
    }
    next();
});
module.exports=mongoose.model('User',userSchema)