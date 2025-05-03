// const cloudinary = require("cloudinary")
// const fs = require("fs")

// const Post = require("../model/postModel")
// // cloudinary settings
// cloudinary.config({
//     cloud_name: process.env.ClOUD_NAME,
//     api_key: process.env.ClOUD_API_KEY,
//     api_secret: process.env.ClOUD_API_SECRET,
// })
// const removeTempFile = (path) => {
//     fs.unlink(path, err => {
//         if (err) throw err
//     })
// }

// const postCtrl = {
  
//     addPost: async (req, res) => {
//         try {
//             const { content } = req.body

//             if (!content) {
//                 return res.status(403).json({ message: "palce fill all fields 😡" })
//             }
//             const { postImage } = req.files
//             const result = await cloudinary.v2.uploader.upload(postImage.tempFilePath,
//                 { folder: "OnlineGallery" }, async (err, data) => {
//                     if (err) {
//                         throw err
//                     } else {
//                         removeTempFile(postImage.tempFilePath)
//                         return data
//                     }
//                 })
//             const image = { url: result.secure_url, public_id: result.public_id }
//             const newImage = await Image.create({ title, categoryId, imgPath: image,})
//             res.status(201).json({ message: "created photo", image: newImage })


//         } catch (error) {
//             console.log(error);
//             res.status(503).json({ message: error.message })


//         }
//     },

    
    
// }
// module.exports = postCtrl
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

      // Foydalanuvchini tekshirish
      const userId = req.user._id;

      if (!content) {
        return res.status(403).json({ message: "Please fill all fields 😡" });
      }

      let image = {};
      if (req.files && req.files.postImage) {
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
        postImage: image,
      });

      res.status(201).json({ message: "Post created successfully!", post: newPost });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
};

module.exports = postCtrl;



