const { validationResult } = require("express-validator")
const bcryptjs = require("bcryptjs")
const User = require("../models/user")


exports.login = (req, res, next) => {
    const { email, password } = req.body
    User.find({ email })
        .then(user => {
            if (!user) {
                const error = new Error("User not found!")
                error.statusCode = 404
                throw error
            }

            return bcryptjs.compare(password, user.password)
        })
        .then(isMatch=>{
            if(!isMatch){
                const error = new Error("Wrong Password!")
                error.statusCode = 401
                throw error
            }


        })
        .catch(err=>{
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.postSignup = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }

    const { email, name, password } = req.body

    bcryptjs.hash(password, 12)
        .then(hashedPassword => {
            const newUser = new User({
                email,
                name,
                password: hashedPassword
            })
            return newUser.save()
        })
        .then(user => {
            res.status(201).json({ message: "New User created!", userId: user._id })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}