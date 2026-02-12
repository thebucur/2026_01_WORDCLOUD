import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WordListsProvider } from './context/WordListsContext';
import { QRCodeVisibilityProvider } from './context/QRCodeVisibilityContext';
import TopBar from './components/TopBar';
import WordCloud from './components/WordCloud';
import VotingPage from './components/VotingPage';
import AdminPage from './components/AdminPage';
import SuperVoterPage from './components/SuperVoterPage';

function AppContent() {
  const location = useLocation();
  const showTopBar = location.pathname !== '/' && location.pathname !== '/vote';

  return (
    <>
      {showTopBar && <TopBar />}
      <Routes>
        <Route path="/" element={<WordCloud />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/supervoter" element={<SuperVoterPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <WordListsProvider>
        <QRCodeVisibilityProvider>
          <AppContent />
        </QRCodeVisibilityProvider>
      </WordListsProvider>
    </Router>
  );
}

export default App;
