const mongoose = require('mongoos');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    // user: {
        
    // },
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
    }
});

module.exports = mongoose.model('posts', PostSchema);