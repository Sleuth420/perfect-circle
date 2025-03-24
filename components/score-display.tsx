"use client"

import { useEffect, useState } from "react"
import { getHighScore, getRecentScores, ScoreData } from "@/lib/score-storage"

export default function ScoreDisplay() {
  const [highScore, setHighScore] = useState<number>(0)
  const [recentScores, setRecentScores] = useState<ScoreData[]>([])

  useEffect(() => {
    // Load scores from localStorage when component mounts
    setHighScore(getHighScore())
    setRecentScores(getRecentScores())
  }, [])

  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  if (highScore === 0 && recentScores.length === 0) {
    return null; // Don't show anything if no scores exist yet
  }

  return (
    <div className="w-full max-w-xs space-y-4 p-4 rounded-lg bg-slate-800/30 backdrop-blur-sm">
      {highScore > 0 && (
        <div className="text-center">
          <h3 className="text-sm uppercase tracking-wider text-slate-300">High Score</h3>
          <p className="text-2xl font-bold">{highScore}%</p>
        </div>
      )}
      
      {recentScores.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-wider text-slate-300 mb-2">Recent Scores</h3>
          <ul className="space-y-2">
            {recentScores.map((score, index) => (
              <li key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">{score.score}%</span>
                <span className="text-xs text-slate-400">{formatDate(score.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 