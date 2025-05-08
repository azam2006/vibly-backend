const express = require("express")
const fileupload = require("express-fileupload")
const dotenv = require("dotenv")
const cors = require("cors")
const mongoose = require("mongoose")
const socketIo = require("socket.io")


const path = require("path")
const http = require("http")
const fs = require("fs")
dotenv.config()

// import....
const authR=require('./src/router/authRouter')
const postR=require('./src/router/postRouter')
const userR =require('./src/router/userRouter')
const commentR =require('./src/router/commentRouter')
const notficantionR =require('./src/router/notificationR')
 
const app=express()
const PORT= process.env.PORT||4001
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileupload({useTempFiles:true}))
 
/// router..
app.use("/api",authR)
app.use("/api",postR)
app.use("/api",userR)
app.use("/api",commentR)
app.use("/api",notficantionR)



const MONGO_URL=process.env.MONGO_URL
mongoose.connect(MONGO_URL).then(()=>{
    app.listen(PORT,()=>{console.log(`${PORT}-working`);
    })
}).catch((err)=>{
    console.log(err);
    
})