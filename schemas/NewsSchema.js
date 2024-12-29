const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true},
    imageUrl: {type: String, required: true},
    title: {type: String, required: true},
    subTitle: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    activeState: {type: Boolean},
});

module.exports = mongoose.model('News', NewsSchema);
