const Post = require("../model/postModel")
const User = require("../model/userModel")
const Comment = require("../model/commetModel");
const Notification = require("../model/notificationM");

const commentCtrl = {
    addComment: async (req, res) => {
        try {
            const { content, postId } = req.body;
            const userId = req.user._id;
            const io = req.app.get('io');

            if (!content) {
                return res.status(402).json({ message: "Please add content" });
            }
            const post = await Post.findById(postId);
            const senderUser = await User.findById(userId).select("username");
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const newComment = await Comment.create({ userId, content, postId });

            await Post.findByIdAndUpdate(postId, {
                $push: { comments: newComment._id }
            });
            await Notification.create({
                recipient: post.userId,
                sender: userId,
                type: 'comment',
                postId: post._id
            });
            io.to(post.userId.toString()).emit('newNotification', {
                type: 'comment', 
                sender: senderUser,
                postId: post._id 
            });



            res.status(201).json({ message: "Comment added successfully!", comment: newComment });

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },

    getComment: async (req, res) => {
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
    getAdminComment: async(req,res)=>{
            try {
               if (!req.user.isAdmin) {
              return res.status(403).json({ message: "You don't have an access" });
            }
              const getComment = await Comment.find().populate("userId", "username surname profileImage").sort({ createdAt:-1 })
              // console.log(getComment);
              res.status(200).json({ message: "get all comments",comments:getComment })
            } catch (error) {
              console.log(error);
              res.status(401).json({ message: error.message });
           
          }
    },
    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: "Comment is not found!" });
            }

            const post = await Post.findById(comment.postId);
            if (!post) {
                return res.status(404).json({ message: "Post is not found!" });
            }

            if (comment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ message: "You can delete only your comment!" });
            }

            await Post.findByIdAndUpdate(comment.postId, {
                $pull: { comments: comment._id }
            });

            await Comment.findByIdAndDelete(commentId);

            return res.status(200).json({ message: "Comment is deleted successfully", comment });

        } catch (error) {
            console.error(error);
            return res.status(503).json({ message: error.message });
        }
    },
    updateComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({ message: "Content is required to update comment" });
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            // faqat o'z kommentini yangilashga ruxsat berish
            if (comment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({ message: "You can only update your own comment" });
            }

            comment.content = content;
            await comment.save();

            return res.status(200).json({ message: "Comment updated successfully", comment });

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    }
}
module.exports = commentCtrl

