import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WordCloud from './components/WordCloud';
import VotingPage from './components/VotingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WordCloud />} />
        <Route path="/vote" element={<VotingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
