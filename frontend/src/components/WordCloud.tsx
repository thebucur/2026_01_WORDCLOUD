import { useState, useEffect, useCallback } from 'react';
import { Word } from '../types/word';
import { getWords } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import FloatingWord from './FloatingWord';
import QRCode from './QRCode';
import './WordCloud.css';

const WordCloud = () => {
  const [words, setWords] = useState<Word[]>([]);

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, []);

  useWebSocket(handleWordsUpdate);

  useEffect(() => {
    // Load initial words
    getWords().then((initialWords) => {
      setWords(initialWords);
    });
  }, []);

  const maxVotes = words.length > 0 ? Math.max(...words.map(w => w.votes)) : 1;
  const sortedWords = [...words].sort((a, b) => b.votes - a.votes);
  const largestWord = sortedWords[0];
  
  // Only mark as largest if it has more than 1 vote (not initial state)
  const hasCenterWord = maxVotes > 1 && largestWord;

  return (
    <div className="word-cloud-container">
      {words.map((word, index) => {
        // Word is largest only if maxVotes > 1 (meaning at least one word has been voted)
        const isLargest = hasCenterWord && word.text === largestWord.text;
        return (
          <FloatingWord
            key={word.text}
            word={word.text}
            votes={word.votes}
            maxVotes={maxVotes}
            isLargest={isLargest}
            index={index}
          />
        );
      })}
      <QRCode />
    </div>
  );
};

export default WordCloud;
