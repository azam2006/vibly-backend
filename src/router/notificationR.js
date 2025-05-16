const express = require("express");
const router=express.Router()
const middelware=require("../middleware/userMiddleware")
const Notification=require("../controller/notificationCtrl")

router.get('/notifications',middelware,Notification.getNTF)
router.put('/notifications/read/:id',middelware,Notification.checkNTF)
router.delete('/notifications/:id',middelware,Notification.deleteOneNTF)
router.delete('/notifications',middelware,Notification.deleteAllNTF)

module.exports=router
