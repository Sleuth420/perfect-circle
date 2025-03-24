"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getHighScore, getRecentScores, ScoreData } from "@/lib/score-storage"

interface ResultScreenProps {
  score: number
  onReset: () => void
  onTryAgain: () => void
}

export default function ResultScreen({ score, onReset, onTryAgain }: ResultScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const roundedScore = Math.round(score * 100)

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

  // Get feedback based on score
  const getFeedback = () => {
    if (roundedScore >= 95) return "Perfect! You're a circle master!"
    if (roundedScore >= 90) return "Almost perfect! Impressive!"
    if (roundedScore >= 80) return "Great job! Very circular!"
    if (roundedScore >= 70) return "Good effort! Keep practicing!"
    if (roundedScore >= 50) return "Not bad, but you can do better!"
    return "That's more of an... abstract shape."
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h2 className="text-4xl font-bold">Your circle is</h2>
      <div className="text-8xl font-bold mb-2">
        <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
          {displayScore}%
        </span>
      </div>
      <p className="text-2xl mb-2">{getFeedback()}</p>
      
      {isNewHighScore && (
        <div className="text-xl font-bold text-yellow-400 animate-pulse mb-2">
          NEW HIGH SCORE!
        </div>
      )}
      
      {!isNewHighScore && highScore > 0 && (
        <div className="text-md text-slate-300 mb-2">
          High Score: {highScore}%
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onTryAgain}>
          Try Again
        </Button>
        <Button onClick={onReset} variant="outline">
          Main Menu
        </Button>
      </div>
    </div>
  )
}

