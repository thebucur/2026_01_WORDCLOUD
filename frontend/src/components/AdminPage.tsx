import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Word } from '../types/word';
import { adminGetStats, adminResetVotes, adminDeleteWord, adminAddWord, AdminStats } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import './AdminPage.css';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWordsUpdate = useCallback((newWords: Word[]) => {
    // Update stats when words change via WebSocket
    if (isAuthenticated && stats) {
      const totalVotes = newWords.reduce((sum, word) => sum + word.votes, 0);
      setStats({
        totalWords: newWords.length,
        totalVotes,
        words: newWords.sort((a, b) => b.votes - a.votes),
      });
    }
  }, [isAuthenticated, stats]);

  useWebSocket(handleWordsUpdate);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const statsData = await adminGetStats(password);
      setStats(statsData);
      setIsAuthenticated(true);
      // Store password in sessionStorage for subsequent requests
      sessionStorage.setItem('adminPassword', password);
    } catch (err: any) {
      setError('Parolă incorectă. Te rugăm să încerci din nou.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if already authenticated
    const storedPassword = sessionStorage.getItem('adminPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      adminGetStats(storedPassword)
        .then((statsData) => {
          setStats(statsData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          sessionStorage.removeItem('adminPassword');
        });
    }
  }, []);

  const handleResetVotes = async () => {
    if (!window.confirm('Ești sigur că vrei să resetezi toate voturile?')) {
      return;
    }

    setLoading(true);
    try {
      const adminPassword = sessionStorage.getItem('adminPassword') || password;
      await adminResetVotes(adminPassword);
      const updatedStats = await adminGetStats(adminPassword);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error resetting votes:', error);
      alert('Eroare la resetarea voturilor. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (word: string) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi cuvântul "${word}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const adminPassword = sessionStorage.getItem('adminPassword') || password;
      await adminDeleteWord(adminPassword, word);
      const updatedStats = await adminGetStats(adminPassword);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Eroare la ștergerea cuvântului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setLoading(true);
    try {
      const adminPassword = sessionStorage.getItem('adminPassword') || password;
      await adminAddWord(adminPassword, newWord.trim());
      setNewWord('');
      const updatedStats = await adminGetStats(adminPassword);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error adding word:', error);
      alert('Eroare la adăugarea cuvântului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setStats(null);
    sessionStorage.removeItem('adminPassword');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-container">
          <h1>Panou de Administrare</h1>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="password">Parolă:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introdu parola de administrare"
                disabled={loading}
                className="password-input"
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading || !password} className="login-button">
              {loading ? 'Se conectează...' : 'Conectare'}
            </button>
          </form>
          <button onClick={() => navigate('/')} className="back-button">
            ← Înapoi la Word Cloud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Panou de Administrare</h1>
          <button onClick={handleLogout} className="logout-button">
            Deconectare
          </button>
        </div>

        {stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Cuvinte</h3>
              <p className="stat-value">{stats.totalWords}</p>
            </div>
            <div className="stat-card">
              <h3>Total Voturi</h3>
              <p className="stat-value">{stats.totalVotes}</p>
            </div>
          </div>
        )}

        <div className="admin-section">
          <h2>Lista Cuvintelor</h2>
          {stats && stats.words.length === 0 ? (
            <p className="empty-message">Nu există cuvinte momentan.</p>
          ) : (
            <div className="words-table">
              <table>
                <thead>
                  <tr>
                    <th>Cuvânt</th>
                    <th>Voturi</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.words.map((word) => (
                    <tr key={word.text}>
                      <td className="word-cell">{word.text}</td>
                      <td className="votes-cell">{word.votes}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleDeleteWord(word.text)}
                          disabled={loading}
                          className="delete-button"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-section">
          <h2>Adaugă Cuvânt Nou</h2>
          <form onSubmit={handleAddWord} className="add-word-form">
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
              className="add-button"
            >
              Adaugă
            </button>
          </form>
        </div>

        <div className="admin-section">
          <h2>Acțiuni</h2>
          <button
            onClick={handleResetVotes}
            disabled={loading}
            className="reset-button"
          >
            Resetează toate voturile
          </button>
        </div>

        <div className="admin-footer">
          <button onClick={() => navigate('/')} className="back-button">
            ← Înapoi la Word Cloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
