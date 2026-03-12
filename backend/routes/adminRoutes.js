const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const StudentProfile = require('../models/Student');
const Settings = require('../models/Settings');
const Feedback = require('../models/Feedback');

const SUPER_ADMIN_EMAIL = 'admin123@gmail.com';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        
        const usersWithProfile = await Promise.all(users.map(async (user) => {
            if (user.role === 'student') {
                const profile = await StudentProfile.findOne({ user: user._id });
                return { ...user, rollNumber: profile ? profile.rollNumber : '' };
            }
            return user;
        }));

        res.json(usersWithProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update user role, name, email or rollNumber
// @route   PUT /api/admin/user/:id
// @access  Private (Admin)
router.put('/user/:id', protect, authorize('admin'), async (req, res) => {
    const { name, email, role, rollNumber } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Protect Super Admin from being modified by others
        if (user.email === SUPER_ADMIN_EMAIL && req.user.email !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Cannot modify Super Admin account' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        await user.save();

        if (user.role === 'student' && rollNumber) {
            await StudentProfile.findOneAndUpdate(
                { user: user._id },
                { rollNumber },
                { upsert: true }
            );
        }

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private (Admin)
router.delete('/user/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Protect Super Admin from being deleted
        if (user.email === SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Super Admin account cannot be deleted' });
        }

        if (user.role === 'student') {
            await StudentProfile.findOneAndDelete({ user: user._id });
        }
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get current settings (attendance limit)
// @route   GET /api/admin/settings
// @access  Private (Admin)
router.get('/settings', protect, authorize('admin'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ attendanceLimit: 75 });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update attendance limit setting
// @route   PUT /api/admin/settings
// @access  Private (Admin)
router.put('/settings', protect, authorize('admin'), async (req, res) => {
    const { attendanceLimit } = req.body;
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ attendanceLimit });
        } else {
            settings.attendanceLimit = attendanceLimit;
            await settings.save();
        }
        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all student feedback
// @route   GET /api/admin/feedback
// @access  Private (Admin)
router.get('/feedback', protect, authorize('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ submittedAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update student feedback (Edit)
// @route   PUT /api/admin/feedback/:id
// @access  Private (Admin)
router.put('/feedback/:id', protect, authorize('admin'), async (req, res) => {
    const { message } = req.body;
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        feedback.message = message || feedback.message;
        await feedback.save();
        res.json({ message: 'Feedback updated', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete student feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private (Admin)
router.delete('/feedback/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
