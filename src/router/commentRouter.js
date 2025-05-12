const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Comment=require("../controller/commetCtrl")

router.post('/comment',middelware,Comment.addComment)
router.get('/comment/:postId',Comment.getComment)
router.delete('/comment/:commentId',middelware,Comment.deleteComment)
router.put('/comment/:commentId',middelware,Comment.updateComment)

module.exports=router
