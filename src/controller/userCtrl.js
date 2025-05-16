const notificationM = require("../model/notificationM");
const Post = require("../model/postModel");
const User = require("../model/userModel")
const Comment = require("../model/commetModel")
const Notification = require("../model/notificationM")
const cloudinary = require("cloudinary")
const bcrypt = require("bcrypt");
const fs = require("fs")

cloudinary.config({
  cloud_name: process.env.ClOUD_NAME,
  api_key: process.env.ClOUD_API_KEY,
  api_secret: process.env.ClOUD_API_SECRET,
});

const removeTempFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error("Temporary file could not be removed:", err.message);
    } else {
      console.log("Temporary file removed:", path);
    }
  });
};
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

      const posts = await Post.find({ userId }).sort({ likes: -1 });

      res.status(200).json({
        message: "found user", user: {
          ...user,
          posts: posts
        }
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

      res.status(200).json({ message: "find users", users });
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
  },
  follow: async (req, res) => {
    try {
      const { id } = req.params; // kimni follow qilish kerak
      const userId = req.user._id;    // kim follow qilyapti
      const io = req.app.get('io');

      if (userId === id) {
        return res.status(400).json({ message: "You can't follow yourself" });
      }

      const userToFollow = await User.findById(id);
      const currentUser = await User.findById(userId);

      if (!userToFollow || !currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isFollowing = userToFollow.follower.includes(userId);
      const senderUser = await User.findById(userId).select("username");

      if (isFollowing) {
        // unfollow
        userToFollow.follower.pull(userId);
        currentUser.followed.pull(id);
      } else {
        // follow
        userToFollow.follower.push(userId);
        currentUser.followed.push(id);
        await notificationM.create({
          recipient: userToFollow._id,
          sender: userId,
          type: 'follow'
        });
        io.to(userToFollow._id.toString()).emit('newNotification', {
          type: 'follow',
          sender: senderUser
        });

      }

      await userToFollow.save();
      await currentUser.save();

      res.status(200).json({
        message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
        followersCount: userToFollow.follower.length,
        user: userToFollow
      });

    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isAdmin = req.userAdmin;

      // Faqat o'zini yoki admin o'chira oladi
      if (userId.toString() !== id.toString() && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Post va commentlarni topamiz
      const posts = await Post.find({ userId: id });
      const comments = await Comment.find({ userId: id });
      const notifications = await Notification.find({ recipient: id });

      // Postlar mavjud bo‘lsa, ularga tegishli commentlar va rasmni o‘chiramiz
      if (posts.length > 0) {
        for (const post of posts) {
          await Comment.deleteMany({ postId: post._id });

          if (post.postImage?.public_id) {
            await cloudinary.v2.uploader.destroy(post.postImage.public_id);
          }
        }
        await Post.deleteMany({ userId: id });
      }

      // Commentlar mavjud bo‘lsa, o‘chiramiz
      if (comments.length > 0) {
        await Comment.deleteMany({ userId: id });
      }
      if (notifications.length > 0) {
        await Comment.deleteMany({ recipient: id });
      }

      // Follower/followed ro‘yxatlaridan olib tashlaymiz
      await User.updateMany({ follower: id }, { $pull: { follower: id } });
      await User.updateMany({ followed: id }, { $pull: { followed: id } });

      // Cloudinary dagi profil rasm(lar)ini o‘chirish
      if (user.profileImage?.public_id) {
        await cloudinary.v2.uploader.destroy(user.profileImage.public_id);
      }


      // Foydalanuvchini o‘chirish
      await user.deleteOne();

      res.status(200).json({
        message: "User and associated data deleted successfully",
        deletedUser: user,
        deletedPosts: posts,
        deletedComments: comments
      });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isAdmin = req.userAdmin;
      const updateData = { ...req.body };

      if (userId.toString() !== id.toString() && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
        if (updateData.email) {
      const oldUser = await User.findOne({ email:updateData.email });
      if (oldUser && oldUser._id.toString() !== id.toString()) {
        return res.status(400).json({ message: "This email already exists!" });
      }
    }

         if(updateData.password && updateData.password.length > 0){
                    const hashedPassword= await bcrypt.hash(updateData.password,10)
                    updateData.password=hashedPassword
                }else{
                    delete updateData.password
                }     

      if (req.files?.profileImage) {
        const file = req.files.profileImage;

        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "onlineGallary"
        });
        // Eski rasmni o‘chirish
        if (user.profileImage?.public_id) {
          await cloudinary.v2.uploader.destroy(user.profileImage.public_id);
        }

        // Yangi rasmni Cloudinary’ga yuklash

        // Vaqtinchalik faylni o‘chirish
        removeTempFile(file.tempFilePath);

        // Rasmni yangilangan ma'lumotlarga qo‘shish
       updateData.profileImage = {
          url: result.url,
          public_id: result.public_id
        };
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

      res.status(200).json({
        message: "User updated successfully",
        updatedUser
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }









}

module.exports = userCtrl
