const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Post=require("../controller/postCtrl")

router.post('/post',middelware,Post.addPost)
router.get('/post',Post.getPost)
router.delete('/post/:id',middelware,Post.deletePost)
router.put('/post/:id',middelware,Post.updatePost)
router.get('/post/:postId',Post.getOnePost)
router.get('/post/followed',middelware,Post.getFollowersPosts)
router.put("/like/:postId",middelware, Post.likePost);


module.exports=router
