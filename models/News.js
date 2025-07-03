



const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')


const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});
newsSchema.plugin(mongoosePaginate);
const newsModel = mongoose.model('News', newsSchema);
module.exports = newsModel;

// Example usage of paginate on the model, not the schema
// newsModel.paginate({}, { limit: 10, page: 1 }, (err, result) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
// });