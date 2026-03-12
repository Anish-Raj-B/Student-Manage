const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const StudentProfile = require('../models/Student');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// @desc    Get all students
// @route   GET /api/instructor/students
// @access  Private (Instructor)
router.get('/students', protect, authorize('instructor'), async (req, res) => {
    try {
        const students = await StudentProfile.find().populate('user', 'name email');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update student marks and attendance
// @route   PUT /api/instructor/marks/:studentId
// @access  Private (Instructor)
router.put('/marks/:studentId', protect, authorize('instructor'), async (req, res) => {
    const { grades } = req.body;
    try {
        const student = await StudentProfile.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // grades array includes: subject, marks, presentClasses, totalClasses
        student.grades = grades;
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update student name and rollNumber
// @route   PUT /api/instructor/student/:studentId
// @access  Private (Instructor)
router.put('/student/:studentId', protect, authorize('instructor'), async (req, res) => {
    const { name, rollNumber, course } = req.body;
    try {
        const student = await StudentProfile.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (name) {
            await User.findByIdAndUpdate(student.user, { name });
        }
        if (rollNumber) {
            student.rollNumber = rollNumber;
        }
        if (course !== undefined) {
            student.course = course;
        }
        
        if (rollNumber || course !== undefined) {
            await student.save();
        }

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get student feedback (Read only)
// @route   GET /api/instructor/feedback
// @access  Private (Instructor)
router.get('/feedback', protect, authorize('instructor'), async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ submittedAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
