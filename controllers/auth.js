const { validationResult } = require("express-validator")
const User = require("../models/user")

exports.postSignup = (req, res, next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const {email, name, password} = req.body

    
}