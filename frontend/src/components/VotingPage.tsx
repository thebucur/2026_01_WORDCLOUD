import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Word } from '../types/word';
import { getWords, voteWord } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import './VotingPage.css';

const VOTED_KEY = 'wordcloud_voted';

const VotingPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const navigate = useNavigate();

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, []);

  // Listen for real-time updates via WebSocket
  useWebSocket(handleWordsUpdate);

  useEffect(() => {
    loadWords();
    // Check if user has already voted
    const voted = localStorage.getItem(VOTED_KEY);
    if (voted === 'true') {
      setHasVoted(true);
    }
  }, []);

  const loadWords = async () => {
    try {
      const wordsData = await getWords();
      setWords(wordsData);
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const handleVote = async (word: string) => {
    // Check if user has already voted
    if (hasVoted) {
      alert('Ai votat deja! Poți vota doar o singură dată.');
      return;
    }

    setLoading(true);
    try {
      await voteWord(word);
      // Mark user as voted
      localStorage.setItem(VOTED_KEY, 'true');
      setHasVoted(true);
      // Stay on voting page - words will update via WebSocket
      // Small delay to allow vote processing
      await new Promise(resolve => setTimeout(resolve, 100));
      alert('Mulțumim pentru votul tău!');
    } catch (error) {
      console.error('Error voting:', error);
      alert('Eroare la votare. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voting-page">
      <div className="voting-container">
        <h1>Votează un Cuvânt</h1>
        
        {hasVoted && (
          <div className="voted-message">
            <p>✓ Ai votat deja! Mulțumim pentru participare.</p>
            <p className="voted-subtext">Poți vedea rezultatele în timp real pe pagina principală.</p>
          </div>
        )}

        <div className="words-list">
          <h2>Cuvinte disponibile</h2>
          {words.length === 0 ? (
            <p className="empty-message">Nu există cuvinte momentan.</p>
          ) : (
            <div className="words-grid">
              {words.map((word) => (
                <div key={word.text} className="word-item">
                  <span className="word-text">{word.text}</span>
                  <span className="word-votes">{word.votes} voturi</span>
                  <button
                    onClick={() => handleVote(word.text)}
                    disabled={loading || hasVoted}
                    className="vote-button"
                  >
                    {hasVoted ? 'Ai votat deja' : 'Votează'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="actions-section">
          <button onClick={() => navigate('/')} className="back-button">
            ← Înapoi la Word Cloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
