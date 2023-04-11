const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const dotenv = require('dotenv');
const Schema = mongoose.Schema;

const VentureSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
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
    featured: {
        type: Boolean,
        default: false
    },
    likes: {
        type: Number,
        default: 0
    },
    website: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    elevatorPitch: {
        type: String,
        required: true,
    },
    logoFile: {
        type: String,
    },
    stage: {
        type: Schema.Types.ObjectId,
        ref: 'stages',
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    ventureCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ventureCategories'
    }
}, {usePushEach: true});

VentureSchema.plugin(URLSlugs('name', {field: 'slug'}));

module.exports = mongoose.model('ventures', VentureSchema);