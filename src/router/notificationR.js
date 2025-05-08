const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Notification=require("../controller/notificationCtrl")

router.get('/ntf',middelware,Notification.getNTF)
router.put('/ntf/read',middelware,Notification.checkNTF)

module.exports=router
