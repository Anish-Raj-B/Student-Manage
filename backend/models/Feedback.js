const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true
    },
    studentName: { type: String }, // Redundancy for easier display if needed, but ref is better
    message: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
