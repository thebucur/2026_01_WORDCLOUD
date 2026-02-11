import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWordLists } from '../context/WordListsContext';
import './TopBar.css';

const TopBar = () => {
  const { lists, activeListId, setActiveList, isAdmin } = useWordLists();
  const [switching, setSwitching] = useState(false);
  const location = useLocation();

  const handleListChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const listId = e.target.value;
    if (!listId || listId === activeListId) return;
    setSwitching(true);
    try {
      await setActiveList(listId);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        {isAdmin && (
          <div className="top-bar-list-switcher">
            <label htmlFor="word-list-select" className="top-bar-label">
              Listă:
            </label>
            <select
              id="word-list-select"
              className="top-bar-select"
              value={activeListId}
              onChange={handleListChange}
              disabled={switching || lists.length === 0}
              title="Schimbă lista activă"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            {switching && <span className="top-bar-switching">...</span>}
          </div>
        )}
        <nav className="top-bar-nav">
          <Link
            to="/"
            className={`top-bar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Word Cloud
          </Link>
          <Link
            to="/vote"
            className={`top-bar-link ${location.pathname === '/vote' ? 'active' : ''}`}
          >
            Votează
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`top-bar-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default TopBar;
