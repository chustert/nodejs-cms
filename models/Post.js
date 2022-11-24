const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        required: true
    },
    body: {
        type: String,
        required: true,
    },
    file: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
}, {usePushEach: true});

module.exports = mongoose.model('posts', PostSchema);