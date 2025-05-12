const cloudinary = require("cloudinary");
const fs = require("fs");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const Comment = require("../model/commetModel");
const notificationM = require("../model/notificationM");
const { log } = require("console");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.ClOUD_NAME,
  api_key: process.env.ClOUD_API_KEY,
  api_secret: process.env.ClOUD_API_SECRET,
});

const removeTempFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

const postCtrl = {
  addPost: async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user._id;

      if (!content) {
        return res.status(403).json({ message: "Please fill all fields 😡" });
      }


      let image = {};

      // postImage mavjud bo'lsa Cloudinary'ga yuklash
      if (req.files?.postImage) {
        const { postImage } = req.files;

        const result = await cloudinary.v2.uploader.upload(postImage.tempFilePath, {
          folder: "OnlineGallery",
        });

        removeTempFile(postImage.tempFilePath);

        image = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }


      const newPost = await Post.create({
        userId,
        content,
        postImage: image, // bo'sh bo‘lsa {}, aks holda rasm ma'lumotlari
      });

      res.status(201).json({ message: "Post created successfully!", post: newPost });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
getFollowersPosts: async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select("followed");
    const followedIds = currentUser.followed;

    // 2. Follow qilingan userlarning postlari (likes bo‘yicha)
    const followedPosts = await Post.find({ userId: { $in: followedIds } })
      .populate("userId", "username profileImage")
      .sort({ likes: -1 });

    // 3. Follow qilingan post IDlari
    const followedPostIds = followedPosts.map(post => post._id.toString());

    // 4. Qolgan postlar, takrorlanmasin
    const otherPosts = await Post.find({
        _id: { $nin: followedPostIds }
    })
      .populate("userId", "username profileImage")
      .sort({ likes: -1 });

    // 5. Birlashtirish: Follow qilinganlar tepada, boshqalar pastda
    const allPosts = [...followedPosts, ...otherPosts];

    res.status(200).json(allPosts);
    
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: error.message });
  }
},


  getOnePost: async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await Post.findById(postId).populate("userId", "username profileImage");

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ message: "Post found", post });

    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user._id;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const isLiked = post.likes.includes(userId);
      if (isLiked) {
        //  unliked
        post.likes.pull(userId);
      } else {
        // like
        post.likes.push(userId);
        if (userId.toString() !== post.userId.toString()) {
          await notificationM.create({
            recipient: post.userId,
            sender: userId,
            type: 'like',
            postId: post._id
          });
        }
      }

     
      await post.save();


      res.status(200).json({
        message: isLiked ? "Post unliked" : "Post liked",
        likesCount: post.likes.length,
        allLikes: post
      });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
 
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isAdmin = req.userAdmin

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }


      if (post.userId.toString() !== userId.toString() && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Agar Cloudinary rasmi mavjud bo‘lsa, o‘chirilsin
      if (post.postImage?.public_id) {
        await cloudinary.v2.uploader.destroy(post.postImage.public_id);
      }

      // Kommentlarni o‘chirish
      await Comment.deleteMany({ postId: post._id });

      // Postni o‘chirish
      await post.deleteOne();

      res.status(200).json({ message: "Post deleted successfully", deletedPost: post });



    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isAdmin = req.userAdmin;


      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const isOwner = post.userId.toString() === userId.toString();

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const content = req.body.content?.trim();
      if (content) post.content = content;

      // Rasmni butunlay o‘chirish (foydalanuvchi belgilasa)
      if (req.body.removeImage === "true" && post.postImage?.public_id) {
        await cloudinary.v2.uploader.destroy(post.postImage.public_id);
        post.postImage = {}; // rasm maydoni bo‘shatildi
      }

      // Yangi rasm bo‘lsa: eski rasmni o‘chirib, yangisini qo‘shamiz
      if (req.files?.postImage) {
        const { postImage } = req.files;
 
        const result = await cloudinary.v2.uploader.upload(postImage.tempFilePath, {
          folder: "OnlineGallery",
        });

        if (post.postImage?.public_id) {
          await cloudinary.v2.uploader.destroy(post.postImage.public_id);
        }       

        removeTempFile(postImage.tempFilePath);

        post.postImage = {
          url: result.url,
          public_id: result.public_id,
        };
      }

      await post.save();

      res.status(200).json({ message: "Post updated successfully", post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
};


module.exports = postCtrl;



  // getPost: async (req, res) => {
  //   try {
  //     const getPost = await Post.find().sort({ likes: -1 })
  //     // console.log(getPost);
  //     res.status(200).json({ message: "get all Posts", getPost })
  //   } catch (error) {
  //     console.log(error);
  //     res.status(503).json({ message: error.message });
  //   }
  // }, getFollowersPosts: async (req, res) => {
  //   try {
  //     const currentUserId = req.user._id;

  //     // 1. Kim meni kuzatadi? follower bo‘lib turgan userlar:
  //     const followers = await User.find({ follower: currentUserId }).select('_id');

  //     const followerIds = followers.map(user => user._id);

  //     // 2. Shu userlarning postlarini topamiz
  //     const posts = await Post.find({ userId: { $in: followerIds } })
  //       .populate('userId', 'username profileImage')
  //       .sort({ likes: -1 });
        

  //     res.status(200).json(posts);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(503).json({ message: error.message });
  //   }
  // },