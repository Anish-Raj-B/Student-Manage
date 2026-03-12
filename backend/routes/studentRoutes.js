const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const StudentProfile = require('../models/Student');
const Feedback = require('../models/Feedback');
const Settings = require('../models/Settings');

// @desc    Get student profile, marks and attendance
// @route   GET /api/student/me
// @access  Private (Student)
router.get('/me', protect, authorize('student'), async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Also return current attendance limit
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({ attendanceLimit: 75 });

        res.json({ profile, attendanceLimit: settings.attendanceLimit });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Submit student feedback
// @route   POST /api/student/feedback
// @access  Private (Student)
router.post('/feedback', protect, authorize('student'), async (req, res) => {
    const { message } = req.body;
    if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'Feedback message is required' });
    }
    try {
        const profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const feedback = await Feedback.create({
            student: profile._id,
            studentName: profile.user?.name,
            message: message.trim()
        });

        res.json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
