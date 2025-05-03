const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postImage: {
        type: Object,
        default:{}
    },
    content: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);