const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true
    },

    
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },

    // O'qildi yoki yo'qmi
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    // createdAt va updatedAt avtomatik qo‘shiladi
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
