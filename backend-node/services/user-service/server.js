const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = require('../../prisma');
const auth = require('../../middleware/auth');

const app = express();
const PORT = process.env.USER_PORT || 5012;

app.use(cors());
app.use(express.json());

// Get stats
app.get('/api/user/stats', auth, async (req, res) => {
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

// Update stats
app.post('/api/user/stats', auth, async (req, res) => {
  const { loggedHours, weeklyGoal, studiedToday, weeklyHours } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const updateData = {};

    if (typeof loggedHours === 'number' && loggedHours > 0) {
      updateData.studiedToday = Math.max(0, user.studiedToday + loggedHours);
      updateData.weeklyHours = Math.max(0, user.weeklyHours + loggedHours);
    } else {
      if (typeof studiedToday === 'number') {
        updateData.studiedToday = Math.max(0, studiedToday);
      }
      if (typeof weeklyHours === 'number') {
        updateData.weeklyHours = Math.max(0, weeklyHours);
      }
    }

    if (typeof weeklyGoal === 'number' && weeklyGoal > 0) {
      updateData.weeklyGoal = weeklyGoal;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        studiedToday: true,
        weeklyHours: true,
        weeklyGoal: true,
      }
    });

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[User Service] Running on port ${PORT}`);
  });
}

module.exports = app;
