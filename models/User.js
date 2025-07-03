const mongoose = require('mongoose');
const mongoosePaginate  =require('mongoose-paginate-v2')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['author', 'admin'],
        required: true,
        default: "author"
    }
});

userSchema.plugin(mongoosePaginate);
// 🔐 Password Hashing Middleware
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
