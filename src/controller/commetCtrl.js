const Post = require("../model/postModel")
const Comment = require("../model/commetModel")

const commentCtrl={
    addComment:(req,res)=>{
        try {
        const {content,postId}=req.body
        const userId = req.user._id;
        if(!content){
            return res.status(402).json({message:"place add content"})
        }
        const addComment=Comment.create({userId,content})
        res.status(201).json({ message: "Post created successfully!", comment:addComment });
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    getComment:(req,res)=>{
        try {
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    deleteComment:(req,res)=>{
        try {
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    updateComment:(req,res)=>{
        try {
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    }
}



