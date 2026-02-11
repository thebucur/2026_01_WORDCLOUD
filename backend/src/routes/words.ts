import { Router, Request, Response } from 'express';
import { wordStore } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const words = wordStore.getWords();
  res.json(words);
});

router.post('/vote', (req: Request, res: Response) => {
  const { word } = req.body;
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }

  const success = wordStore.voteWord(word);
  
  if (success) {
    res.json({ success: true, words: wordStore.getWords() });
  } else {
    res.status(404).json({ error: 'Word not found' });
  }
});

router.post('/propose', (req: Request, res: Response) => {
  const { word } = req.body;
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }

  const success = wordStore.addWord(word);
  
  if (success) {
    res.json({ success: true, words: wordStore.getWords() });
  } else {
    res.status(400).json({ error: 'Invalid word' });
  }
});

router.post('/reset-votes', (req: Request, res: Response) => {
  wordStore.resetAllVotes();
  res.json({ success: true, words: wordStore.getWords() });
});

// Admin routes - protected with password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this in production!

const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  const password = req.headers['x-admin-password'] as string;
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Admin: Get statistics
router.get('/admin/stats', authenticateAdmin, (req: Request, res: Response) => {
  const stats = wordStore.getStats();
  res.json(stats);
});

// Admin: Reset all votes
router.post('/admin/reset-votes', authenticateAdmin, (req: Request, res: Response) => {
  wordStore.resetAllVotes();
  res.json({ success: true, words: wordStore.getWords() });
});

// Admin: Delete a word
router.delete('/admin/word', authenticateAdmin, (req: Request, res: Response) => {
  const { word } = req.body;
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }

  const success = wordStore.deleteWord(word);
  
  if (success) {
    res.json({ success: true, words: wordStore.getWords() });
  } else {
    res.status(404).json({ error: 'Word not found' });
  }
});

// Admin: Add a word
router.post('/admin/word', authenticateAdmin, (req: Request, res: Response) => {
  const { word } = req.body;
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }

  const success = wordStore.addWord(word);
  
  if (success) {
    res.json({ success: true, words: wordStore.getWords() });
  } else {
    res.status(400).json({ error: 'Invalid word or word already exists' });
  }
});

export default router;
