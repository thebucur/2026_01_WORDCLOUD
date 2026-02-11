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

// Word lists (public read)
router.get('/lists', (req: Request, res: Response) => {
  const data = wordStore.getLists();
  res.json(data);
});

// Admin: Create a new list
router.post('/lists', authenticateAdmin, (req: Request, res: Response) => {
  const { name, copyFromActive } = req.body;
  const nameStr = typeof name === 'string' ? name : 'Listă nouă';
  const copy = Boolean(copyFromActive);
  const list = wordStore.createList(nameStr, copy);
  res.status(201).json(list);
});

// Admin: Set active list
router.put('/lists/active', authenticateAdmin, (req: Request, res: Response) => {
  const { listId } = req.body;
  if (!listId || typeof listId !== 'string') {
    return res.status(400).json({ error: 'listId is required' });
  }
  const success = wordStore.setActiveList(listId);
  if (success) {
    res.json({ success: true, words: wordStore.getWords(), activeListId: listId });
  } else {
    res.status(404).json({ error: 'List not found' });
  }
});

// Admin: Delete a list
router.delete('/lists/:listId', authenticateAdmin, (req: Request, res: Response) => {
  const { listId } = req.params;
  const success = wordStore.deleteList(listId);
  if (success) {
    res.json({ success: true, lists: wordStore.getLists() });
  } else {
    res.status(400).json({
      error: 'Cannot delete list (not found or cannot delete the last list)',
    });
  }
});

export default router;
