import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WordListsProvider } from './context/WordListsContext';
import TopBar from './components/TopBar';
import WordCloud from './components/WordCloud';
import VotingPage from './components/VotingPage';
import AdminPage from './components/AdminPage';

function App() {
  return (
    <Router>
      <WordListsProvider>
        <TopBar />
        <Routes>
          <Route path="/" element={<WordCloud />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </WordListsProvider>
    </Router>
  );
}

export default App;
