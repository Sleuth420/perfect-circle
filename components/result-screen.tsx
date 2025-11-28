"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { getHighScore, getRecentScores, ScoreData } from "@/lib/score-storage"

interface ResultScreenProps {
  score: number
  onReset: () => void
  onTryAgain: () => void
}

// Memoize feedback function outside component to avoid recreation
const getFeedback = (roundedScore: number): string => {
  if (roundedScore >= 95) return "Perfect! You're a circle master!"
  if (roundedScore >= 90) return "Almost perfect! Impressive!"
  if (roundedScore >= 80) return "Great job! Very circular!"
  if (roundedScore >= 70) return "Good effort! Keep practicing!"
  if (roundedScore >= 50) return "Not bad, but you can do better!"
  return "That's more of an... abstract shape."
}

export default function ResultScreen({ score, onReset, onTryAgain }: ResultScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  
  // Memoize roundedScore calculation
  const roundedScore = useMemo(() => Math.round(score * 100), [score])
  
  // Memoize feedback message
  const feedbackMessage = useMemo(() => getFeedback(roundedScore), [roundedScore])

  // Load high score and check if current score is a new high score
  useEffect(() => {
    const currentHighScore = getHighScore()
    setHighScore(currentHighScore)
    
    if (roundedScore > currentHighScore) {
      setIsNewHighScore(true)
    }
  }, [roundedScore])

  // Animate the score counting up
  useEffect(() => {
    let start = 0
    const increment = Math.max(1, Math.floor(roundedScore / 50))

    const timer = setInterval(() => {
      start += increment
      if (start >= roundedScore) {
        setDisplayScore(roundedScore)
        clearInterval(timer)
      } else {
        setDisplayScore(start)
      }
    }, 20)

    return () => clearInterval(timer)
  }, [roundedScore])

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 text-center animate-fade-in w-full max-w-2xl">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">Your circle is</h2>
      <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-3 sm:mb-4">
        <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
          {displayScore}%
        </span>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-slate-700 dark:text-slate-300 font-medium px-4">{feedbackMessage}</p>
      
      {isNewHighScore && (
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-500 dark:text-amber-400 animate-pulse mb-3 sm:mb-4 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30">
          🎉 NEW HIGH SCORE! 🎉
        </div>
      )}
      
      {!isNewHighScore && highScore > 0 && (
        <div className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
          High Score: <span className="text-emerald-500 dark:text-emerald-400 font-bold">{highScore}%</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 sm:mt-4 w-full sm:w-auto">
        <Button 
          onClick={onTryAgain}
          className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          Try Again
        </Button>
        <Button 
          onClick={onReset} 
          variant="outline"
          className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          Main Menu
        </Button>
      </div>
    </div>
  )
}

