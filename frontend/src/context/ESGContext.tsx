import React, { createContext, useContext, useState, useEffect } from 'react';

interface ESGContextType {
  score: number;
  lastUpdate: Date;
  updateScore: (newScore: number) => void;
}

const ESGContext = createContext<ESGContextType | undefined>(undefined);

export function ESGProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(845);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const updateScore = (newScore: number) => {
    setScore(newScore);
    setLastUpdate(new Date());
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate score by +/- 1-2 points
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      setScore(prev => {
        const next = prev + fluctuation;
        // Keep it within a reasonable range
        return Math.min(Math.max(next, 800), 950);
      });
      setLastUpdate(new Date());
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <ESGContext.Provider value={{ score, lastUpdate, updateScore }}>
      {children}
    </ESGContext.Provider>
  );
}

export function useESG() {
  const context = useContext(ESGContext);
  if (context === undefined) {
    throw new Error('useESG must be used within an ESGProvider');
  }
  return context;
}
