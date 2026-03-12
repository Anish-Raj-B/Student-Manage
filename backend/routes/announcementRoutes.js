const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ eventDate: 1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    const { title, description, eventDate } = req.body;
    try {
        const announcement = await Announcement.create({
            title,
            description,
            eventDate
        });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
