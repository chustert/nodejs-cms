const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VentureLikesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    venture: {
        type: Schema.Types.ObjectId,
        ref: 'ventures'
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('ventureLikes', VentureLikesSchema);