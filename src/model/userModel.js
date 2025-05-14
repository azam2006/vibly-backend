const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true },
  surname: { 
    type: String,
     required: true 
    },
  hobby: { 
    type: String,
    default:''
    },
  work: { 
    type: String,
    default:''
    },
  email: { 
    type: String,  
    required: true,
    // unique: true 
    },
  password: {
     type: String
    , required: true 
   },
  profileImage: {
     type: Object,
     default: () => ({})
   },
  follower: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' }],
  followed: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' }],

  role:{
      type:String,
      default:"user",
      enum:['user','admin','mode'], 
  },
     savedPosts: [{ 
      type: mongoose.Schema.Types.ObjectId,
       ref: 'Post' }],

},{ timestamps: true,minimize:true });

module.exports = mongoose.model('User', UserSchema);
