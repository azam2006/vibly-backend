const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const User=require("../controller/userCtrl")

router.get('/user',User.getAllUsers)
router.get('/user/top', middelware,User.getTopUsers)
router.get('/user/:id',User.getOneUser)
router.get('/user',User.searchUser)
router.delete('/user/:id',middelware,User.deleteUser)
router.put('/user/:id',middelware,User.updateUser)


router.put('/follow/:id',middelware,User.follow)
router.put('/save/:postId',middelware,User.savedPost)


module.exports=router