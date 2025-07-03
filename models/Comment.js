



const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');


const commentSchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

commentSchema.plugin(paginate);
module.exports = mongoose.model('Comment', commentSchema);