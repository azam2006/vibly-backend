const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Post=require("../controller/postCtrl")

router.post('/post',middelware,Post.addPost)
router.get('/post/top',middelware,Post.getPost)
router.get('/post',middelware,Post.getFollowersPosts)

router.delete('/post/:id',middelware,Post.deletePost)
router.put('/post/:id',middelware,Post.updatePost)
router.get('/post/:postId',Post.getOnePost)
router.put("/like/:postId",middelware, Post.likePost);

// router.get('/post/followed',middelware,Post.getFollowersPosts)
module.exports=router
