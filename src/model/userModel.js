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
    },
  work: { 
    type: String,
     required: true 
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
     type: Object
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

  dateBirth: {
     type: Date,
     required:true
     }
},{ timestamps: true });

module.exports = mongoose.model('User', UserSchema);
