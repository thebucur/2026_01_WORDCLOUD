import { useState, useEffect, useCallback, useRef } from 'react';
import { Word } from '../types/word';
import { getWords } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import FloatingWord from './FloatingWord';
import QRCode from './QRCode';
import './WordCloud.css';

const WordCloud = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const initializedWordsRef = useRef(new Set<string>());

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, []);

  useWebSocket(handleWordsUpdate);

  useEffect(() => {
    // Load initial words
    setIsLoading(true);
    setLoadingProgress(0);
    getWords().then((initialWords) => {
      setWords(initialWords);
      // Set initial progress to 10% when words are fetched
      setLoadingProgress(10);
    });
  }, []);

  // Callback when a word is initialized
  const handleWordInitialized = useCallback((wordText: string) => {
    initializedWordsRef.current.add(wordText);
    const totalWords = words.length;
    const initializedCount = initializedWordsRef.current.size;
    
    // Calculate progress from 10% to 45% as words initialize
    // 10% to 45% = 35% range
    const progressIncrement = 35 / totalWords;
    const newProgress = Math.min(45, 10 + (initializedCount * progressIncrement));
    setLoadingProgress(newProgress);
    
    // When all words are initialized, wait for animations to start before hiding loading screen
    if (initializedCount >= totalWords && totalWords > 0) {
      // Calculate maximum animation delay: delay = index * 0.768, so max is (totalWords - 1) * 0.768
      // Wait for the maximum delay plus a buffer to ensure all words have started moving
      const maxDelay = (totalWords - 1) * 0.768;
      const waitTime = Math.max(800, maxDelay * 1000 + 500); // At least 800ms, or max delay + 500ms buffer
      
      // Animate progress from 45% to 100% during the wait time
      const progressSteps = 20;
      const progressStepTime = waitTime / progressSteps;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        const progress = 45 + (currentStep * (55 / progressSteps)); // 45% to 100% = 55% range
        setLoadingProgress(Math.min(100, progress));
        
        if (currentStep >= progressSteps) {
          clearInterval(progressInterval);
        }
      }, progressStepTime);
      
      // Hide loading screen after wait time
      setTimeout(() => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setIsLoading(false);
      }, waitTime);
    }
  }, [words.length]);

  // Reset initialized words when words array changes significantly
  useEffect(() => {
    if (words.length > 0 && initializedWordsRef.current.size === 0) {
      // New words loaded, reset
      initializedWordsRef.current.clear();
    }
  }, [words.length]);

  const maxVotes = words.length > 0 ? Math.max(...words.map(w => w.votes)) : 1;
  const sortedWords = [...words].sort((a, b) => b.votes - a.votes);
  const largestWord = sortedWords[0];
  
  // Only mark as largest if it has more than 1 vote (not initial state)
  const hasCenterWord = maxVotes > 1 && largestWord;

  return (
    <div className="word-cloud-container">
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-text">Loading Words...</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="progress-percentage">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      )}
      
      {/* Words - hidden during loading */}
      <div className={`words-container ${isLoading ? 'hidden' : ''}`}>
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
              onInitialized={handleWordInitialized}
            />
          );
        })}
      </div>
      <QRCode />
    </div>
  );
};

export default WordCloud;
