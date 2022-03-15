const { validationResult } = require("express-validator")
const fs = require("fs")
const path = require("path")
const Post = require("../models/post")



exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPageValue = 2
    let totalItems;
    Post.countDocuments()
        .then(totalDoc => {
            totalItems = totalDoc

            return Post.find()
                .skip((currentPage - 1) * perPageValue)
                .limit(perPageValue)
        }).then(posts => {
            if (!posts) {
                const error = new Error("Couldn't fetch posts")
                err.statusCode = 404
                throw error
            }

            res.status(200).json({
                message: "Fetched posts successfully",
                posts: posts,
                totalItems
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Could not find Post!")
                error.statusCode = 404
                throw error
            }

            res.status(200).json({ message: "Post fetched!", post: post })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const title = req.body.title
    const content = req.body.content
    const image = req.file

    const errors = validationResult(req)
    if (!errors.isEmpty() || !image) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        throw error
    }

    const createPost = new Post({
        title: title,
        content,
        imageUrl: image.path.split("\\")[0] + "/" + image.path.split("\\")[1],
        creator: { name: "Tunde" }
    })

    createPost.save()
        .then(data => {
            res.status(201).json({
                message: "Post created succesfully",
                post: data
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}


exports.updatePost = (req, res, next) => {
    let { title, content, image } = req.body
    const postId = req.params.postId

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        throw error
    }

    if (req.file) {
        console.log(req.file);
        image = req.file.path.split("\\")[0] + "/" + req.file.path.split("\\")[1]
        console.log(image);
    }

    if (!image) {
        const error = new Error("No file selected!")
        error.statusCode = 422
        throw error
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Could not find Post!")
                error.statusCode = 404
                throw error
            }
            if (image !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title
            post.content = content
            post.imageUrl = image
            return post.save()
        })
        .then(result => {
            res.status(200).json({ message: "Post Updated", post: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            // Check logged in user
            if (!post) {
                const error = new Error("Could not find Post!")
                error.statusCode = 404
                throw error
            }
            clearImage(post.imageUrl)

            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            console.log(result);
            res.status(200).json({ message: "Post deleted successfully!" })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath)
    fs.unlink(filePath, err => console.log(err))
}