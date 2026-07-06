const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { generateFlashcards } = require('../utils/ai');

// Get all Flashcard Sets for User
router.get('/', auth, async (req, res) => {
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

// Create/Generate new Flashcard Set via AI
router.post('/generate', auth, async (req, res) => {
  const { title, text, sourceType } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and content text are required to generate flashcards.' });
  }

  try {
    // 1. Generate cards from Gemini AI or local fallback engine
    const generatedCards = await generateFlashcards(text, sourceType || 'text');

    // 2. Write to Supabase using Prisma transaction
    const newSet = await prisma.flashcardSet.create({
      data: {
        title,
        userId: req.userId,
        cards: {
          create: generatedCards.map(c => ({
            front: c.front,
            back: c.back,
            type: c.type || 'front_back',
            hint: c.hint || null,
            difficulty: c.difficulty || 'medium',
            tags: c.tags || ''
          }))
        }
      },
      include: {
        cards: true
      }
    });

    console.log(`[AI Flashcard] Created Set "${title}" with ${newSet.cards.length} cards for User ${req.userId}`);

    res.status(201).json({
      success: true,
      set: newSet
    });
  } catch (error) {
    console.error('AI Flashcard generation failed:', error);
    res.status(500).json({ error: 'Server error during AI flashcard generation.' });
  }
});

// Toggle Bookmark status of a Card
router.post('/:cardId/bookmark', auth, async (req, res) => {
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
router.delete('/sets/:setId', auth, async (req, res) => {
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

module.exports = router;
