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
    follow: async (req, res) => {
        try {

        } catch (error) {
            console.log(error);
            res.status(503).json({ message: error.message });
        }
    },
    unfollow: async (req, res) => {
        try {

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



}

module.exports = userCtrl
