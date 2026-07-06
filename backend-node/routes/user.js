const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// Get User Study Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        studiedToday: true,
        weeklyHours: true,
        weeklyGoal: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      success: true,
      stats: {
        studiedToday: user.studiedToday,
        weeklyHours: user.weeklyHours,
        weeklyGoal: user.weeklyGoal,
      }
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Server error during fetching study stats.' });
  }
});

// Update or Log User Study Stats
router.post('/stats', auth, async (req, res) => {
  const { loggedHours, weeklyGoal, studiedToday, weeklyHours } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Determine the updates
    const updateData = {};

    // 1. If user logs new hours, increment the values
    if (typeof loggedHours === 'number' && loggedHours > 0) {
      updateData.studiedToday = Math.max(0, user.studiedToday + loggedHours);
      updateData.weeklyHours = Math.max(0, user.weeklyHours + loggedHours);
    } 
    // 2. Otherwise allow absolute overrides if provided
    else {
      if (typeof studiedToday === 'number') {
        updateData.studiedToday = Math.max(0, studiedToday);
      }
      if (typeof weeklyHours === 'number') {
        updateData.weeklyHours = Math.max(0, weeklyHours);
      }
    }

    // 3. Update the weekly hours goal target if provided
    if (typeof weeklyGoal === 'number' && weeklyGoal > 0) {
      updateData.weeklyGoal = weeklyGoal;
    }

    // Save update in Supabase
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        studiedToday: true,
        weeklyHours: true,
        weeklyGoal: true,
      }
    });

    console.log(`[Stats Update] User ${req.userId} logged stats successfully:`, updateData);

    res.json({
      success: true,
      stats: {
        studiedToday: updatedUser.studiedToday,
        weeklyHours: updatedUser.weeklyHours,
        weeklyGoal: updatedUser.weeklyGoal,
      }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Server error during updating study stats.' });
  }
});

module.exports = router;
