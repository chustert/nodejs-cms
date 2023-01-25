const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const dotenv = require('dotenv');
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
    slug: {
        type: String
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
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

PostSchema.plugin(URLSlugs('title', {field: 'slug'}));

module.exports = mongoose.model('posts', PostSchema);