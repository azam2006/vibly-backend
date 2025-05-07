const Post = require("../model/postModel")
const Comment = require("../model/commetModel")

const commentCtrl={
    addComment: async (req, res) => {
        try {
            const { content, postId } = req.body;
            const userId = req.user._id;
    
            if (!content) {
                return res.status(402).json({ message: "Please add content" });
            }
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const newComment = await Comment.create({ userId, content, postId });
    
            await Post.findByIdAndUpdate(postId, {
                $push: { comments: newComment._id }
            });
    
            res.status(201).json({ message: "Comment added successfully!", comment: newComment });
    
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    
    getComment:async(req,res)=>{
        try {
            const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({ message: "postId is required" });
        }

        const comments = await Comment.find({ postId })
            .populate("userId", "username email profileImage ") // foydalanuvchi ma’lumotlarini olib kelish
            // .populate("postId", "title"); // ixtiyoriy: post nomini ham ko‘rsatish

        res.status(200).json({ message: "Comments for the post", comments });
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    deleteComment:async(req,res)=>{
        try {
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    updateComment:async(req,res)=>{
        try {
            
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    }
}
module.exports=commentCtrl

