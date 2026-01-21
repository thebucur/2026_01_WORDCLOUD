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

export default router;
