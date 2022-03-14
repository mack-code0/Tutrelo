const express = require("express")
const path = require("path")
const Mongoose = require("mongoose")

const app = express()

const FeedRoute = require("./routes/feed")

app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "images")))

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})


app.use("/feed", FeedRoute)

app.use((error, req, res, next)=>{
    console.log(error);
    const statusCode = error.statusCode || 500
    const message = error.message
    res.status(statusCode).json({message: message})
})

Mongoose.connect("mongodb://127.0.0.1:27017/messages")
.then(res=>{
    app.listen(8080)
})
.catch(err=>{
    console.log(err);
})