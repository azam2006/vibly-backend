const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const User=require("../controller/userCtrl")

router.get('/user',User.getAllUsers)
router.get('/user/:id',User.getOneUser)
router.get('/user',User.searchUser)

module.exports=router