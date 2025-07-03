
const mongoose = require('mongoose');


const SettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true
    },
    siteFooter: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    siteLogo: {
        type: String,
    }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;