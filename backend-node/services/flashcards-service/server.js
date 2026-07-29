const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = require('../../prisma');
const auth = require('../../middleware/auth');

const app = express();
const PORT = process.env.FLASHCARDS_PORT || 5014;

app.use(cors());
app.use(express.json());

// Get all flashcard sets
app.get('/api/flashcards', auth, async (req, res) => {
  try {
    const sets = await prisma.flashcardSet.findMany({
      where: { userId: req.userId },
      include: {
        cards: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, sets });
  } catch (error) {
    console.error('Fetch flashcards error:', error);
    res.status(500).json({ error: 'Server error during fetching flashcard sets.' });
  }
});

// GET Cards due for review (SM-2 Spaced Repetition)
app.get('/api/flashcards/due', auth, async (req, res) => {
  try {
    const now = new Date();
    const sets = await prisma.flashcardSet.findMany({
      where: { userId: req.userId },
      include: {
        cards: {
          where: {
            dueDate: { lte: now }
          }
        }
      }
    });

    const dueCards = [];
    sets.forEach(s => {
      s.cards.forEach(c => {
        dueCards.push({ ...c, setName: s.title });
      });
    });

    res.json({ success: true, count: dueCards.length, cards: dueCards });
  } catch (error) {
    console.error('Fetch due flashcards error:', error);
    res.status(500).json({ error: 'Server error fetching due flashcards.' });
  }
});

// POST Review card with rating (SM-2 Algorithm)
app.post('/api/flashcards/:cardId/review', auth, async (req, res) => {
  const { cardId } = req.params;
  const { rating } = req.body; // 'again', 'hard', 'good', 'easy'

  try {
    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { set: true }
    });

    if (!card || card.set.userId !== req.userId) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }

    // Map string ratings to SM-2 quality scores (0-5 scale)
    let q = 4;
    if (rating === 'again') q = 1;
    else if (rating === 'hard') q = 2;
    else if (rating === 'good') q = 4;
    else if (rating === 'easy') q = 5;

    let { interval, repetition, easeFactor } = card;

    if (q >= 3) {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
    } else {
      repetition = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    const updatedCard = await prisma.flashcard.update({
      where: { id: cardId },
      data: {
        interval,
        repetition,
        easeFactor,
        dueDate
      }
    });

    res.json({
      success: true,
      card: updatedCard,
      nextReviewDays: interval
    });
  } catch (error) {
    console.error('Flashcard SM-2 review failed:', error);
    res.status(500).json({ error: 'Server error processing SM-2 review.' });
  }
});

// Toggle bookmark
app.post('/api/flashcards/:cardId/bookmark', auth, async (req, res) => {
  const { cardId } = req.params;

  try {
    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { set: true }
    });

    if (!card || card.set.userId !== req.userId) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }

    const updatedCard = await prisma.flashcard.update({
      where: { id: cardId },
      data: { bookmarked: !card.bookmarked }
    });

    res.json({
      success: true,
      bookmarked: updatedCard.bookmarked
    });
  } catch (error) {
    console.error('Bookmark toggle failed:', error);
    res.status(500).json({ error: 'Server error toggling bookmark.' });
  }
});

// Delete Flashcard Set
app.delete('/api/flashcards/sets/:setId', auth, async (req, res) => {
  const { setId } = req.params;

  try {
    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!set || set.userId !== req.userId) {
      return res.status(404).json({ error: 'Set not found.' });
    }

    await prisma.flashcardSet.delete({
      where: { id: setId }
    });

    res.json({ success: true, message: 'Flashcard set deleted.' });
  } catch (error) {
    console.error('Delete set failed:', error);
    res.status(500).json({ error: 'Server error deleting set.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Flashcards Service] Running on port ${PORT}`);
});
