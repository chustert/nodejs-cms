const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user'
    },
    sentMessages: [{
        type: Schema.Types.ObjectId,
        ref: 'messages'
    }],
    receivedMessages: [{
        type: Schema.Types.ObjectId,
        ref: 'messages'
    }],
    // USE THIS IF REFERENCES IN THE USER SCHEMA ARE NEEDED - not complete yet, only works for posts
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'posts'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
}, {usePushEach: true});

module.exports = mongoose.model('users', UserSchema);