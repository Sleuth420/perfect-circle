// Keys for localStorage
const HIGH_SCORE_KEY = 'perfect-circle-high-score';
const RECENT_SCORES_KEY = 'perfect-circle-recent-scores';

// Types
export interface ScoreData {
  score: number;
  timestamp: number;
}

// Functions to manage high score
export const getHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const storedScore = localStorage.getItem(HIGH_SCORE_KEY);
  return storedScore ? parseInt(storedScore, 10) : 0;
};

export const saveHighScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  
  const currentHighScore = getHighScore();
  if (score > currentHighScore) {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  }
};

// Functions to manage recent scores
export const getRecentScores = (): ScoreData[] => {
  if (typeof window === 'undefined') return [];
  
  const storedScores = localStorage.getItem(RECENT_SCORES_KEY);
  return storedScores ? JSON.parse(storedScores) : [];
};

export const addRecentScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  
  const recentScores = getRecentScores();
  
  // Add the new score with a timestamp
  const newScore: ScoreData = {
    score,
    timestamp: Date.now()
  };
  
  // Add to the beginning of the array and limit to 5 entries
  const updatedScores = [newScore, ...recentScores].slice(0, 5);
  
  localStorage.setItem(RECENT_SCORES_KEY, JSON.stringify(updatedScores));
};

// Save both high score and add to recent scores
export const saveScore = (score: number): void => {
  saveHighScore(score);
  addRecentScore(score);
}; 