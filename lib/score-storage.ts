// Keys for localStorage
const HIGH_SCORE_KEY = 'perfect-circle-high-score';
const RECENT_SCORES_KEY = 'perfect-circle-recent-scores';

// Types
export interface ScoreData {
  score: number;
  timestamp: number;
}

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      // Handle quota exceeded or private browsing mode
      if (error instanceof DOMException) {
        console.warn('localStorage.setItem failed:', error.name, error.message);
      } else {
        console.warn('localStorage.setItem failed:', error);
      }
      return false;
    }
  }
};

// Functions to manage high score
export const getHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const storedScore = safeLocalStorage.getItem(HIGH_SCORE_KEY);
    if (!storedScore) return 0;
    
    const parsed = parseInt(storedScore, 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('Failed to get high score:', error);
    return 0;
  }
};

export const saveHighScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  
  // Validate score is a finite number within valid range
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    console.warn('Invalid score provided to saveHighScore:', score);
    return;
  }
  
  try {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
      safeLocalStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  } catch (error) {
    console.warn('Failed to save high score:', error);
  }
};

// Functions to manage recent scores
export const getRecentScores = (): ScoreData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedScores = safeLocalStorage.getItem(RECENT_SCORES_KEY);
    if (!storedScores) return [];
    
    const parsed = JSON.parse(storedScores);
    // Validate the parsed data is an array
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    // Validate each item has the expected structure
    return parsed.filter((item): item is ScoreData => 
      item && 
      typeof item === 'object' &&
      typeof item.score === 'number' &&
      typeof item.timestamp === 'number'
    );
  } catch (error) {
    console.warn('Failed to get recent scores:', error);
    // If data is corrupted, clear it
    try {
      safeLocalStorage.setItem(RECENT_SCORES_KEY, JSON.stringify([]));
    } catch {
      // Ignore errors when clearing corrupted data
    }
    return [];
  }
};

export const addRecentScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  
  // Validate score is a finite number within valid range
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    console.warn('Invalid score provided to addRecentScore:', score);
    return;
  }
  
  try {
    const recentScores = getRecentScores();
    
    // Add the new score with a timestamp
    const newScore: ScoreData = {
      score: Math.round(score), // Ensure integer score
      timestamp: Date.now()
    };
    
    // Add to the beginning of the array and limit to 5 entries
    const updatedScores = [newScore, ...recentScores].slice(0, 5);
    
    const success = safeLocalStorage.setItem(RECENT_SCORES_KEY, JSON.stringify(updatedScores));
    if (!success) {
      console.warn('Failed to save recent scores - localStorage may be full or unavailable');
    }
  } catch (error) {
    console.warn('Failed to add recent score:', error);
  }
};

// Save both high score and add to recent scores
export const saveScore = (score: number): void => {
  saveHighScore(score);
  addRecentScore(score);
}; 