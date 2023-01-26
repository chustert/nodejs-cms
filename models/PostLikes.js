const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostLikesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('postLikes', PostLikesSchema);