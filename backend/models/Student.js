const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    marks: { type: Number, default: 0 },
    presentClasses: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
});

const FeedbackSchema = new mongoose.Schema({
    message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
});

const StudentProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rollNumber: { type: String, unique: true },
    course: { type: String, default: '' },
    grades: [GradeSchema],
    feedback: [FeedbackSchema],
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
