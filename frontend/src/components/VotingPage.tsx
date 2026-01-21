import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Word } from '../types/word';
import { getWords, voteWord, proposeWord, resetVotes } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import './VotingPage.css';

const VotingPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, []);

  // Listen for real-time updates via WebSocket
  useWebSocket(handleWordsUpdate);

  useEffect(() => {
    loadWords();
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
      // Stay on voting page - words will update via WebSocket
      // Small delay to allow vote processing
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Eroare la votare. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setLoading(true);
    try {
      await proposeWord(newWord.trim());
      setNewWord('');
      // Stay on voting page - words will update via WebSocket
      // Small delay to allow word to be added
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error proposing word:', error);
      alert('Eroare la propunerea cuvântului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetVotes = async () => {
    if (!window.confirm('Ești sigur că vrei să resetezi toate voturile?')) {
      return;
    }

    setLoading(true);
    try {
      await resetVotes();
      // Stay on voting page - words will update via WebSocket
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error resetting votes:', error);
      alert('Eroare la resetarea voturilor. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voting-page">
      <div className="voting-container">
        <h1>Votează sau Propune un Cuvânt</h1>
        
        <div className="words-list">
          <h2>Cuvinte existente</h2>
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

        <div className="propose-section">
          <h2>Propune un cuvânt nou</h2>
          <form onSubmit={handlePropose} className="propose-form">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Introdu cuvântul..."
              disabled={loading}
              className="word-input"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={loading || !newWord.trim()}
              className="propose-button"
            >
              Propune
            </button>
          </form>
        </div>

        <div className="actions-section">
          <button 
            onClick={handleResetVotes} 
            disabled={loading}
            className="reset-button"
          >
            Resetează toate voturile
          </button>
          <button onClick={() => navigate('/')} className="back-button">
            ← Înapoi la Word Cloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
