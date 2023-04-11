const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VentureCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('ventureCategories', VentureCategorySchema);