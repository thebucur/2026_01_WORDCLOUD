import { useEffect, useRef, useState } from 'react';
import './FloatingWord.css';

interface FloatingWordProps {
  word: string;
  votes: number;
  maxVotes: number;
  isLargest: boolean;
  index: number;
  position?: { x: number; y: number };
}

const FloatingWord = ({ word, votes, maxVotes, isLargest, index, position }: FloatingWordProps) => {
  const wordRef = useRef<HTMLDivElement>(null);
  const [prevVotes, setPrevVotes] = useState(votes);
  const [prevIsLargest, setPrevIsLargest] = useState(isLargest);
  const [shouldAnimateGrowth, setShouldAnimateGrowth] = useState(false);
  const [shouldAnimateCenter, setShouldAnimateCenter] = useState(false);

  // Detect vote changes and center transitions
  useEffect(() => {
    if (votes > prevVotes) {
      setShouldAnimateGrowth(true);
      setTimeout(() => setShouldAnimateGrowth(false), 600);
    }
    if (!prevIsLargest && isLargest) {
      setShouldAnimateCenter(true);
      setTimeout(() => setShouldAnimateCenter(false), 1000);
    }
    setPrevVotes(votes);
    setPrevIsLargest(isLargest);
  }, [votes, isLargest, prevVotes, prevIsLargest]);

  // Calculate font size proportionally based on votes
  // All words scale proportionally from minimum to maximum size based on vote count
  // Use a much wider range to make differences clearly visible
  const minSize = 12; // Minimum size for words with least votes
  const maxSize = 140; // Maximum size for words with most votes
  const minVotes = 1; // Minimum vote count (all words start at 1)
  
  // Calculate proportional font size based on votes
  // If all words have the same votes, use minSize
  // Otherwise, scale proportionally between minSize and maxSize
  let fontSize: number;
  if (maxVotes === minVotes) {
    fontSize = minSize;
  } else {
    // Scale proportionally: (votes - minVotes) / (maxVotes - minVotes) gives us 0 to 1
    // Multiply by (maxSize - minSize) and add minSize to get the final size
    const voteRatio = (votes - minVotes) / (maxVotes - minVotes);
    fontSize = Math.round(minSize + (voteRatio * (maxSize - minSize)));
  }

  // Calculate font weight based on votes (300 to 900)
  // More votes = bolder (font-weight from 300 to 900)
  // With all starting at 1, we need to handle the weight progression
  const weightBase = 300;
  const weightMax = 900;
  const weightRange = weightMax - weightBase;
  // Normalize: votes-1 because all start at 1, maxVotes-1 for the range
  const normalizedVotes = maxVotes > 1 ? (votes - 1) / (maxVotes - 1) : 0;
  const fontWeight = Math.min(900, weightBase + normalizedVotes * weightRange);

  // Calculate opacity based on votes (0.4 to 0.9) - higher base since all start small
  const opacityBase = 0.4;
  const opacityRange = 0.5;
  const normalizedVotesForOpacity = maxVotes > 1 ? (votes - 1) / (maxVotes - 1) : 0;
  const opacity = opacityBase + normalizedVotesForOpacity * opacityRange;

  // Animation duration - additional 60% slower (38-64 seconds, total 2.56x slower)
  // Center word animates slower (longer duration)
  const baseDuration = isLargest ? 51.2 : (15 + (index % 10) * 1) * 2.56; // 38.4-64s for orbiting words (additional 60% slower)
  const jitterDuration = (3 + Math.random() * 2) * 2.56; // 7.68-12.8s for jitter (additional 60% slower)
  const delay = index * 0.768; // Stagger the animations (additional 60% slower)
  
  // Generate circular orbit parameters - all words orbit around the center (50%, 50%)
  useEffect(() => {
    if (wordRef.current && !isLargest) {
      // Distribute orbits across different radii (15% to 45% of screen)
      // Use index to ensure even distribution
      const minRadius = 15;
      const maxRadius = 45;
      const orbitRadius = minRadius + (Math.random() * (maxRadius - minRadius));
      
      // Random starting angle (0 to 360 degrees)
      const startAngle = Math.random() * 360;
      
      // Add slight elliptical variation for more organic feel
      const ellipseFactorX = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const ellipseFactorY = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      
      // Pre-calculate positions for key points in the circular orbit around center (50%, 50%)
      const calcPosition = (angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = 50 + orbitRadius * ellipseFactorX * Math.cos(angleRad);
        const y = 50 + orbitRadius * ellipseFactorY * Math.sin(angleRad);
        return { x, y };
      };
      
      const positions = {
        p0: calcPosition(startAngle),
        p25: calcPosition(startAngle + 90),
        p50: calcPosition(startAngle + 180),
        p75: calcPosition(startAngle + 270),
        p100: calcPosition(startAngle + 360),
      };
      
      wordRef.current.style.setProperty('--x0', `${positions.p0.x}%`);
      wordRef.current.style.setProperty('--y0', `${positions.p0.y}%`);
      wordRef.current.style.setProperty('--x25', `${positions.p25.x}%`);
      wordRef.current.style.setProperty('--y25', `${positions.p25.y}%`);
      wordRef.current.style.setProperty('--x50', `${positions.p50.x}%`);
      wordRef.current.style.setProperty('--y50', `${positions.p50.y}%`);
      wordRef.current.style.setProperty('--x75', `${positions.p75.x}%`);
      wordRef.current.style.setProperty('--y75', `${positions.p75.y}%`);
      wordRef.current.style.setProperty('--x100', `${positions.p100.x}%`);
      wordRef.current.style.setProperty('--y100', `${positions.p100.y}%`);
      
      // Animation parameters
      wordRef.current.style.setProperty('--jitter-duration', `${jitterDuration}s`);
      wordRef.current.style.setProperty('--orbit-duration', `${baseDuration}s`);
    }
  }, [isLargest, jitterDuration, baseDuration]);

  const style: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: Math.round(fontWeight),
    opacity,
    animationDelay: `${delay}s`,
    zIndex: isLargest ? 100 : Math.floor(votes),
    position: 'absolute',
    // Center word uses fixed position, orbiting words use animation positions
    ...(isLargest && position ? {
      left: `${position.x}%`,
      top: `${position.y}%`,
    } : {
      // Non-center words: position is controlled by CSS animation
      left: '50%',
      top: '50%',
    }),
  };

  // Calculate badge size proportionally larger - about 45% of font size (80% larger than before)
  // This makes the badge scale nicely as text grows with votes
  const badgeSize = fontSize * 0.45; // 80% larger: (fontSize / 4) * 1.8 = fontSize * 0.45
  const badgeFontSize = badgeSize * 0.65; // Font size inside badge

  return (
    <div
      ref={wordRef}
      className={`floating-word ${isLargest ? 'center-word' : ''} ${shouldAnimateGrowth ? 'grow-animation' : ''} ${shouldAnimateCenter ? 'center-transition' : ''}`}
      style={style}
    >
      <span className="word-text" style={{ fontSize: `${fontSize}px` }}>{word}</span>
      <span 
        className="vote-badge"
        style={{
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
          fontSize: `${badgeFontSize}px`,
          lineHeight: `${badgeSize}px`,
        }}
      >
        {votes}
      </span>
    </div>
  );
};

export default FloatingWord;
