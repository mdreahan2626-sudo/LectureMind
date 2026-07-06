const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// Get all Subjects with entire nested tree (Chapters > Topics > Materials)
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: {
        chapters: {
          include: {
            topics: {
              include: {
                materials: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    res.status(500).json({ error: 'Server error during fetching subjects tree.' });
  }
});

// Create a new Subject
router.post('/', auth, async (req, res) => {
  const { name, description, color, tags } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Subject name is required.' });
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        color: color || 'from-blue-600 to-indigo-600',
        tags: tags || '',
        userId: req.userId
      },
      include: {
        chapters: {
          include: {
            topics: {
              include: {
                materials: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Server error during creating subject.' });
  }
});

// Create a new Chapter in a Subject
router.post('/:subjectId/chapters', auth, async (req, res) => {
  const { subjectId } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Chapter name is required.' });
  }

  try {
    // Verify subject ownership
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject || subject.userId !== req.userId) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        subjectId
      },
      include: {
        topics: {
          include: {
            materials: true
          }
        }
      }
    });

    res.status(201).json({ success: true, chapter });
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Server error during creating chapter.' });
  }
});

// Create a new Topic in a Chapter
router.post('/chapters/:chapterId/topics', auth, async (req, res) => {
  const { chapterId } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Topic name is required.' });
  }

  try {
    // Verify chapter subject ownership
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true }
    });

    if (!chapter || chapter.subject.userId !== req.userId) {
      return res.status(404).json({ error: 'Chapter not found.' });
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        chapterId
      },
      include: {
        materials: true
      }
    });

    res.status(201).json({ success: true, topic });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ error: 'Server error during creating topic.' });
  }
});

// Create/Upload a new Study Material in a Topic
router.post('/topics/:topicId/materials', auth, async (req, res) => {
  const { topicId } = req.params;
  const { name, type, content, fileUrl, fileSize } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Material name and type are required.' });
  }

  try {
    // Verify topic ownership path
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        chapter: {
          include: { subject: true }
        }
      }
    });

    if (!topic || topic.chapter.subject.userId !== req.userId) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const material = await prisma.material.create({
      data: {
        name,
        type, // 'note' | 'pdf' | 'ppt' | 'image'
        content,
        fileUrl,
        fileSize
      }
    });

    res.status(201).json({ success: true, material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Server error during creating study material.' });
  }
});

module.exports = router;
