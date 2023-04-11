const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StageSchema = new Schema({
    name: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('stages', StageSchema);