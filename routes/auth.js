const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const User = require("../models/user")
const authController = require("../controllers/auth")



router.post("/login", authController.login)


router.put("/signup", [
    body("email").isEmail().withMessage("This is not an email").custom((value, { req }) => {
        return User.findOne({ email: value })
            .then(user => {
                if (user) {
                    return Promise.reject("Email address already exists")
                }
            })
    }),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty()
], authController.postSignup)

module.exports = router