const express = require("express");
const router=express.Router()
const user=require("../controller/authCtrl")

router.post('/signup',user.signup)
router.post('/login',user.login)

module.exports=router 