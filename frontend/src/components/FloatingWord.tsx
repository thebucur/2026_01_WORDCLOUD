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
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const centerAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect vote changes and center transitions
  useEffect(() => {
    if (votes > prevVotes) {
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setShouldAnimateGrowth(true);
      animationTimeoutRef.current = setTimeout(() => setShouldAnimateGrowth(false), 600);
    }
    if (!prevIsLargest && isLargest) {
      // Clear any existing timeout
      if (centerAnimationTimeoutRef.current) {
        clearTimeout(centerAnimationTimeoutRef.current);
      }
      setShouldAnimateCenter(true);
      centerAnimationTimeoutRef.current = setTimeout(() => setShouldAnimateCenter(false), 1000);
    }
    setPrevVotes(votes);
    setPrevIsLargest(isLargest);
    
    // Cleanup timeouts on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (centerAnimationTimeoutRef.current) {
        clearTimeout(centerAnimationTimeoutRef.current);
      }
    };
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
  const delay = index * 0.768; // Stagger the animations (additional 60% slower)
  
  // Generate circular orbit parameters - all words orbit around the center (50%, 50%)
  // Use useRef to store initial values so they don't recalculate on every render
  // This prevents animation restarts when votes change
  const orbitConfigRef = useRef<{
    positions: { x0: string; y0: string; x25: string; y25: string; x50: string; y50: string; x75: string; y75: string; x100: string; y100: string };
    jitterDuration: number;
    baseDuration: number;
    isLargest: boolean;
  } | null>(null);
  
  // Initialize jitterDuration only once - don't recalculate on every render
  if (!orbitConfigRef.current && !isLargest) {
    const initialJitterDuration = (3 + Math.random() * 2) * 2.56; // 7.68-12.8s for jitter (additional 60% slower)
    // Store in ref to keep it stable across renders
    orbitConfigRef.current = {
      positions: { x0: '', y0: '', x25: '', y25: '', x50: '', y50: '', x75: '', y75: '', x100: '', y100: '' },
      jitterDuration: initialJitterDuration,
      baseDuration,
      isLargest,
    };
  }
  
  // Use stable jitterDuration from ref - don't recalculate on every render
  // This is initialized once in the useEffect below
  const jitterDuration = orbitConfigRef.current?.jitterDuration ?? ((3 + Math.random() * 2) * 2.56);

  useEffect(() => {
    if (wordRef.current && !isLargest) {
      // Only recalculate positions if this is the first render or if the word just changed from largest to orbiting
      // Don't recalculate if we already have valid positions and the word is still orbiting
      const needsRecalculation = !orbitConfigRef.current || 
                                 !orbitConfigRef.current.positions.x0 ||
                                 (orbitConfigRef.current.isLargest && !isLargest);
      
      if (needsRecalculation) {
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
        
        const positionStrings = {
          x0: `${positions.p0.x}%`,
          y0: `${positions.p0.y}%`,
          x25: `${positions.p25.x}%`,
          y25: `${positions.p25.y}%`,
          x50: `${positions.p50.x}%`,
          y50: `${positions.p50.y}%`,
          x75: `${positions.p75.x}%`,
          y75: `${positions.p75.y}%`,
          x100: `${positions.p100.x}%`,
          y100: `${positions.p100.y}%`,
        };
        
        // Store the configuration (use jitterDuration from ref if available, otherwise use current value)
        const stableJitterDuration = orbitConfigRef.current?.jitterDuration ?? jitterDuration;
        orbitConfigRef.current = {
          positions: positionStrings,
          jitterDuration: stableJitterDuration,
          baseDuration,
          isLargest,
        };
      }
      
      // Apply the configuration (from stored or newly calculated) using requestAnimationFrame for smooth updates
      if (orbitConfigRef.current) {
        const config = orbitConfigRef.current;
        // Use requestAnimationFrame to batch style updates and avoid choppiness
        requestAnimationFrame(() => {
          if (wordRef.current && !isLargest) {
            wordRef.current.style.setProperty('--x0', config.positions.x0);
            wordRef.current.style.setProperty('--y0', config.positions.y0);
            wordRef.current.style.setProperty('--x25', config.positions.x25);
            wordRef.current.style.setProperty('--y25', config.positions.y25);
            wordRef.current.style.setProperty('--x50', config.positions.x50);
            wordRef.current.style.setProperty('--y50', config.positions.y50);
            wordRef.current.style.setProperty('--x75', config.positions.x75);
            wordRef.current.style.setProperty('--y75', config.positions.y75);
            wordRef.current.style.setProperty('--x100', config.positions.x100);
            wordRef.current.style.setProperty('--y100', config.positions.y100);
            
            // Animation parameters - only update if changed to avoid animation restarts
            const currentJitter = wordRef.current.style.getPropertyValue('--jitter-duration');
            const currentOrbit = wordRef.current.style.getPropertyValue('--orbit-duration');
            if (!currentJitter || currentJitter !== `${config.jitterDuration}s`) {
              wordRef.current.style.setProperty('--jitter-duration', `${config.jitterDuration}s`);
            }
            if (!currentOrbit || currentOrbit !== `${config.baseDuration}s`) {
              wordRef.current.style.setProperty('--orbit-duration', `${config.baseDuration}s`);
            }
          }
        });
      }
    } else if (isLargest) {
      // Clear orbit config when word becomes largest
      orbitConfigRef.current = null;
      // Ensure center word is properly positioned
      if (wordRef.current) {
        requestAnimationFrame(() => {
          if (wordRef.current && isLargest) {
            wordRef.current.style.left = '50%';
            wordRef.current.style.top = '50%';
          }
        });
      }
    }
    // Remove jitterDuration and baseDuration from dependencies - only update when isLargest changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLargest]);

  const style: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: Math.round(fontWeight),
    opacity,
    animationDelay: `${delay}s`,
    zIndex: isLargest ? 100 : Math.floor(votes),
    position: 'absolute',
    // Center word is always at 50% 50% (handled by CSS !important)
    // Non-center words start at 50% 50% and are animated by CSS
    left: '50%',
    top: '50%',
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
