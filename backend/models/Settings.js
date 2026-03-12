const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    attendanceLimit: { type: Number, default: 75 }, // minimum required attendance %
}, { timestamps: true });

// Only one settings document should exist
module.exports = mongoose.model('Settings', SettingsSchema);
