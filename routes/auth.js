const express = require("express")
const router = express.Router()
const { check } = require("express-validator")
const User = require("../models/user")
const authController = require("../controllers/auth")


router.post("/signup",
    check("email").isEmail().custom((value, { req }) => {
        User.findOne({email: value})
        .then(user=>{
            if(user){
                return Promise.reject("Email address already exists")
            }
        })
    }).normalizeEmail(),
    check("password").trim().isLength({min: 5}),
    check("name").trim().not().isEmpty(),
    authController.postSignup)

module.exports = router