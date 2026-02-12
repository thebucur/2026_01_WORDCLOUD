import { useState, useEffect, useCallback } from 'react';
import { Word } from '../types/word';
import { getWords, voteWord, proposeWord } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { isProfanity } from '../utils/profanityFilter';
import './VotingPage.css';

const VOTED_KEY = 'wordcloud_voted';
const PROPOSED_KEY = 'wordcloud_proposed';

const VotingPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasProposed, setHasProposed] = useState(false);
  const [proposedWord, setProposedWord] = useState('');
  const [proposeError, setProposeError] = useState('');
  const [proposeLoading, setProposeLoading] = useState(false);

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
    // Check if user has already proposed
    const proposed = localStorage.getItem(PROPOSED_KEY);
    if (proposed === 'true') {
      setHasProposed(true);
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

  const handleProposeWord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasProposed) {
      setProposeError('Ai propus deja un cuvânt! Poți propune doar un singur cuvânt.');
      return;
    }

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
      // Mark user as proposed
      localStorage.setItem(PROPOSED_KEY, 'true');
      setHasProposed(true);
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
        <h1>Votează un Cuvânt</h1>
        
        {hasVoted && (
          <div className="voted-message">
            <p>✓ Ai votat deja! Mulțumim pentru participare.</p>
            <p className="voted-subtext">Poți vedea rezultatele în timp real pe pagina principală.</p>
          </div>
        )}

        {/* Propose Word Form */}
        <div className="propose-section">
          <h2>Propune un Cuvânt Nou</h2>
          {hasProposed ? (
            <div className="proposed-message">
              <p>✓ Ai propus deja un cuvânt! Mulțumim pentru contribuție.</p>
            </div>
          ) : (
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
          )}
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
      </div>
    </div>
  );
};

export default VotingPage;
