const { validationResult } = require("express-validator")
const fs = require("fs")
const io = require("../socket")
const path = require("path")
const Post = require("../models/post")
const User = require("../models/user")



exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPageValue = 2

    try {
        const totalItems = await Post.countDocuments()
        const posts = await Post.find()
            .populate("creator")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPageValue)
            .limit(perPageValue)

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

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
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

exports.createPost = async (req, res, next) => {
    const title = req.body.title
    const content = req.body.content
    const image = req.file

    const errors = validationResult(req)
    if (!errors.isEmpty() || !image) {
        const error = new Error("Validation failed! Entered data is Incorrect.")
        error.statusCode = 422
        throw error
    }

    const post = new Post({
        title: title,
        content,
        imageUrl: image.path.split("\\")[0] + "/" + image.path.split("\\")[1],
        creator: req.userId
    })

    try {
        await post.save()
        const user = await User.findById(req.userId)
        user.posts.push(post)
        await user.save()

        io.getIO().emit("posts", { action: "create", post: { ...post._doc, creator: { _id: req.userId, name: user.name } } })

        res.status(201).json({
            message: "Post created succesfully",
            post: post,
            creator: { _id: user._id, name: user.name }
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}


exports.updatePost = async (req, res, next) => {
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

    try {
        const post = await Post.findById(postId).populate("creator")
        if (post.creator._id.toString() !== req.userId) {
            const error = new Error("Not authenticated!")
            error.statusCode = 403
            throw error
        }

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
        const updatedPost = await post.save()

        io.getIO().emit("posts", { action: "update", post: { ...updatedPost._doc } })

        res.status(200).json({ message: "Post Updated", post: updatedPost })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error("Not authenticated!")
                error.statusCode = 403
                throw error
            }

            if (!post) {
                const error = new Error("Could not find Post!")
                error.statusCode = 404
                throw error
            }
            clearImage(post.imageUrl)
            await Post.findByIdAndRemove(postId)

            const user = await User.findById(req.userId)
            await user.posts.pull(postId)
            await user.save()

            io.getIO().emit("posts", {action: "delete", post: postId})

            res.status(200).json({ message: "Post deleted successfully!" })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath)
    fs.unlink(filePath, err => console.log(""))
}