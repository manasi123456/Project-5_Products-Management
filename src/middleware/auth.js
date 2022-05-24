const jwt= require('jsonwebtoken')

const auth = async function(req,res,next) {
    try{
        let token=req.headers["x-api-key"]
        if(!token){
            return res.status(403).send({status:false,message: "token not found"})
        }
        const decodedToken=jwt.verify(token, "uranium_project-5_group_30" )
        if(!decodedToken){
            return res.status(403).send({status:false,message: "Invalid token"})
        }
        req.userId = decodedToken.id
        next()

    }
    catch(err){
        return res.status(500).send({status:false, err:err.message})
    }
}

module.exports= {auth}