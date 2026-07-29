const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const prisma = require('../../prisma');
const auth = require('../../middleware/auth');

const app = express();
const PORT = process.env.SUBJECTS_PORT || 5013;

app.use(cors());
app.use(express.json());

// Get all Subjects tree
app.get('/api/subjects', auth, async (req, res) => {
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

// Create Subject
app.post('/api/subjects', auth, async (req, res) => {
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

// Create Chapter
app.post('/api/subjects/:subjectId/chapters', auth, async (req, res) => {
  const { subjectId } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Chapter name is required.' });
  }

  try {
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

// Create Topic
app.post('/api/subjects/chapters/:chapterId/topics', auth, async (req, res) => {
  const { chapterId } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Topic name is required.' });
  }

  try {
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

// Create Material
app.post('/api/subjects/topics/:topicId/materials', auth, async (req, res) => {
  const { topicId } = req.params;
  const { name, type, content, fileUrl, fileSize } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Material name and type are required.' });
  }

  try {
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

    // Bug Fix: link topicId in data fields!
    const material = await prisma.material.create({
      data: {
        name,
        type, // 'note' | 'pdf' | 'ppt' | 'image'
        content,
        fileUrl,
        fileSize,
        topicId
      }
    });

    res.status(201).json({ success: true, material });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Server error during creating study material.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Subjects Service] Running on port ${PORT}`);
});
