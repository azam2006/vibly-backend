const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Post=require("../controller/postCtrl")

router.post('/post',middelware,Post.addPost)
router.get('/post',Post.getPost)
router.put("/like/:postId",middelware, Post.likePost);


module.exports=router