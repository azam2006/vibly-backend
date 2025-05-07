const Post = require("../model/postModel");
const User = require("../model/userModel")

const userCtrl = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password')
            res.status(200).json({ message: "get all Users", users })

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    getOneUser: async (req, res) => {
        try {
            const userId = req.params.id;

            const user = await User.findById(userId).select("-password");
            if (!user) {
                return res.status(404).json({ message: "User topilmadi" });
            }

            const posts = await Post.find({ userId }).sort({ createdAt: -1 });

            res.status(200).json({
                user,
                posts: posts
            });
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    updateUser: async (req, res) => {
        try {

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    deleteUser: async (req, res) => {
        try {

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    // follow: async (req, res) => {
    //     try {
    //         const { id } = req.params; // kimni follow qilmoqchisiz
    //         const currentUserId = req.user._id;    // hozirgi user
    
    //         if (currentUserId.toString() === id) {
    //             return res.status(400).json({ message: "You can't follow yourself" });
    //         }
    
    //         const userToFollow = await User.findById(id);
    //         const currentUser = await User.findById(currentUserId);
    
    //         if (!userToFollow || !currentUser) {
    //             return res.status(404).json({ message: "User not found" });
    //         }
    
    //         const isAlreadyFollowing = userToFollow.follower.includes(currentUserId);
    
    //         if (isAlreadyFollowing) {
    //             return res.status(200).json({ message: "You are already following this user" });
    //         }
    
    //         // follow qilish
    //         userToFollow.follower.push(currentUserId);
    //         currentUser.followed.push(id);
    
    //         await userToFollow.save();
    //         await currentUser.save();
    
    //         res.status(200).json({
    //             message: "Followed successfully",
    //             followersCount: userToFollow.follower.length,
    //             followedUser:userToFollow
    //         });
    
    //     } catch (error) {
    //         console.log(error);
    //         res.status(503).json({ message: error.message });
    //     }
    // },
    follow: async (req, res) => {
        try {
            const { id } = req.params; // kimni follow qilish kerak
            const userId = req.user._id;    // kim follow qilyapti
    
            if (userId === id) {
                return res.status(400).json({ message: "You can't follow yourself" });
            }
    
            const userToFollow = await User.findById(id);
            const currentUser = await User.findById(userId);
    
            if (!userToFollow || !currentUser) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const isFollowing = userToFollow.follower.includes(userId);
    
            if (isFollowing) {
                // unfollow
                userToFollow.follower.pull(userId);
                currentUser.followed.pull(id);
            } else {
                // follow
                userToFollow.follower.push(userId);
                currentUser.followed.push(id);
            }
    
            await userToFollow.save();
            await currentUser.save();
    
            res.status(200).json({
                message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
                followersCount: userToFollow.follower.length,
                user:userToFollow
            });
    
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    searchUser: async (req, res) => {
        try {
            const query = req.query.search;

            const users = await User.find({
                $or: [
                    { username: { $regex: query, $options: "i" } },
                    { surname: { $regex: query, $options: "i" } }
                ]
            }).select("-password");

            res.status(200).json({message:"find users",users});
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    savedPost: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user._id;
    
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const isAlreadySaved = user.savedPosts.includes(postId);
    
            if (isAlreadySaved) {
                user.savedPosts.pull(postId); // O'chiramiz
            } else {
                user.savedPosts.push(postId); // Qo‘shamiz
            }
    
            await user.save();
            const updatedUser = await User.findById(userId).populate('savedPosts'); // Postlarni to‘liq chiqarish
    
            res.status(200).json({
                message: isAlreadySaved ? "Post removed from saved" : "Post saved",
                allsaved: user.savedPosts,
                savedPosts: updatedUser.savedPosts
            });
        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    }
    
    



}

module.exports = userCtrl
