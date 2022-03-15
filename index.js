const express = require("express")
const path = require("path")
const multer = require("multer")
const Mongoose = require("mongoose")

const app = express()
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "images/")
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().getTime() + "-" + file.originalname)
    }
})


const fileFilter = (req, file, cb)=>{
    if(file.mimetype=="image/jpg" || file.mimetype=="image/png" || file.mimetype=="image/jpeg"){
        cb(null, true)
    }else{
        cb(null, false)
    }
}



const FeedRoute = require("./routes/feed")
const AuthRoute = require("./routes/auth")

app.use(express.json())
app.use(multer({fileFilter: fileFilter, storage: storage}).single("image"))
app.use("/images", express.static(path.join(__dirname, "images")))

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})


app.use("/feed", FeedRoute)
app.use("/auth", AuthRoute)

app.use((error, req, res, next)=>{
    console.log(error);
    const statusCode = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(statusCode).json({message: message, data: error.data})
})

Mongoose.connect("mongodb://127.0.0.1:27017/messages")
.then(res=>{
    app.listen(8080)
})
.catch(err=>{
    console.log(err);
})