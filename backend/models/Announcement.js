const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
