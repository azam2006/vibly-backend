const cloudinary = require("cloudinary");
const fs = require("fs");
const Post = require("../model/postModel");

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
    getPost:async(req,res)=>{
       try {
        const getPost = await Post.find()
        // console.log(getPost);
        res.status(200).json({message:"get all Posts",getPost})
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
          }
  
          // Saqlaymiz
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
  }
  
  };
  

module.exports = postCtrl;



