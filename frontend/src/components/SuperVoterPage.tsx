import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Word } from '../types/word';
import { getWords, voteWord, proposeWord } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { isProfanity } from '../utils/profanityFilter';
import { useQRCodeVisibility } from '../context/QRCodeVisibilityContext';
import './VotingPage.css';

const SuperVoterPage = () => {
  const { isVisible, toggleVisibility } = useQRCodeVisibility();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposedWord, setProposedWord] = useState('');
  const [proposeError, setProposeError] = useState('');
  const [proposeLoading, setProposeLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, []);

  // Listen for real-time updates via WebSocket
  useWebSocket(handleWordsUpdate);

  useEffect(() => {
    loadWords();
    // Load vote count from sessionStorage (resets on page refresh)
    const savedCount = sessionStorage.getItem('supervoter_vote_count');
    if (savedCount) {
      setVoteCount(parseInt(savedCount, 10));
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
    setLoading(true);
    try {
      await voteWord(word);
      const newCount = voteCount + 1;
      setVoteCount(newCount);
      sessionStorage.setItem('supervoter_vote_count', newCount.toString());
      // Stay on voting page - words will update via WebSocket
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Eroare la votare. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleProposeWord = async (e: React.FormEvent) => {
    e.preventDefault();

    const word = proposedWord.trim();
    
    if (!word) {
      setProposeError('Te rugăm să introduci un cuvânt.');
      return;
    }

    // Check if word contains spaces
    if (word.includes(' ')) {
      setProposeError('Te rugăm să introduci doar un singur cuvânt (fără spații).');
      return;
    }

    // Check for profanity
    if (isProfanity(word)) {
      setProposeError('Cuvântul conține limbaj neadecvat. Te rugăm să alegi alt cuvânt.');
      return;
    }

    setProposeError('');
    setProposeLoading(true);

    try {
      await proposeWord(word);
      setProposedWord('');
      alert('Cuvântul tău a fost adăugat cu succes!');
    } catch (error: any) {
      console.error('Error proposing word:', error);
      const errorMessage = error.response?.data?.error || 'Eroare la propunerea cuvântului. Te rugăm să încerci din nou.';
      setProposeError(errorMessage);
    } finally {
      setProposeLoading(false);
    }
  };

  const handleProposedWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow single word (no spaces)
    if (!value.includes(' ')) {
      setProposedWord(value);
      setProposeError('');
    } else {
      setProposeError('Te rugăm să introduci doar un singur cuvânt (fără spații).');
    }
  };

  return (
    <div className="voting-page">
      <div className="voting-container">
        <h1>Super Voter</h1>
        <p className="voting-info" style={{ color: '#667eea', fontWeight: '600' }}>
          ⚡ Modul Super Voter - Poți vota de nelimitat ori
        </p>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={toggleVisibility}
            className="propose-button"
            style={{ fontSize: '14px', padding: '8px 16px' }}
          >
            {isVisible ? '🔲 Ascunde codul QR (pagina principală)' : '📱 Arată codul QR (pagina principală)'}
          </button>
          <Link to="/" style={{ fontSize: '14px', color: '#667eea' }}>
            Vezi pagina principală →
          </Link>
        </div>
        {voteCount > 0 && (
          <div className="voted-message" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <p>✓ Ai votat de {voteCount} {voteCount === 1 ? 'dată' : 'ori'} în această sesiune.</p>
          </div>
        )}

        {/* Propose Word Form */}
        <div className="propose-section">
          <h2>Propune un Cuvânt Nou</h2>
          <form onSubmit={handleProposeWord} className="propose-form">
            <input
              type="text"
              value={proposedWord}
              onChange={handleProposedWordChange}
              placeholder="Introdu un cuvânt..."
              className="propose-input"
              disabled={proposeLoading}
              maxLength={50}
            />
            <button
              type="submit"
              disabled={proposeLoading || !proposedWord.trim()}
              className="propose-button"
            >
              {proposeLoading ? 'Se adaugă...' : 'Propune'}
            </button>
          </form>
          {proposeError && (
            <div className="propose-error">
              {proposeError}
            </div>
          )}
        </div>

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
                    disabled={loading}
                    className="vote-button"
                  >
                    Votează
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperVoterPage;
