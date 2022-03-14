const { validationResult } = require("express-validator")
const Post = require("../models/post")

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts=>{
        if(!posts){
            const error = new Error("Couldn't fetch posts")
            err.statusCode = 404
            throw error
        }
        
        res.status(200).json({
            message: "Fetched posts successfully",
            posts: posts
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    })
    
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId

    Post.findById(postId)
    .then(post=>{
        if(!post){
            const error = new Error("Could not find Post!")
            error.statusCode = 404
            throw error
        }

        res.status(200).json({message: "Post fetched!", post: post})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    })
}

exports.createPost = (req, res, next) => {
    const title = req.body.title
    const content = req.body.content

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        throw error
    }

    const createPost = new Post({
        title: title,
        content,
        imageUrl: "images/food.jpg",
        creator: { name: "Tunde" }
    })

    createPost.save()
    .then(data=>{
        res.status(201).json({
            message: "Post created succesfully",
            post: data
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    })
}