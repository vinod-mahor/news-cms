const mongoose = require('mongoose');
const slugify = require('slugify');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2'); // ✅ correct plugin

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true }); // ✅ correct use of timestamps

categorySchema.pre('validate', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

categorySchema.plugin(aggregatePaginate); // ✅ correct plugin

module.exports = mongoose.model('Category', categorySchema);
