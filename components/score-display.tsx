"use client"

import { useEffect, useState, useMemo } from "react"
import { getHighScore, getRecentScores, ScoreData } from "@/lib/score-storage"

export default function ScoreDisplay() {
  const [highScore, setHighScore] = useState<number>(0)
  const [recentScores, setRecentScores] = useState<ScoreData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load scores from localStorage when component mounts
    setHighScore(getHighScore())
    setRecentScores(getRecentScores())
  }, [])

  // Memoize formatted dates to avoid recalculating on every render
  const formattedScores = useMemo(() => {
    return recentScores.map(score => ({
      ...score,
      formattedDate: new Date(score.timestamp).toLocaleString()
    }))
  }, [recentScores])

  // Render nothing until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-full max-w-xs" aria-hidden="true" />
  }

  // Always render container to avoid hydration mismatch, but hide if no scores
  if (highScore === 0 && recentScores.length === 0) {
    return <div className="w-full max-w-xs" aria-hidden="true" />
  }

  return (
    <div className="w-full max-w-xs space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-slate-100/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-300/50 dark:border-slate-700/50 shadow-xl">
      {highScore > 0 && (
        <div className="text-center pb-3 sm:pb-4 border-b border-slate-300/50 dark:border-slate-700/50">
          <h3 className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">High Score</h3>
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
            {highScore}%
          </p>
        </div>
      )}
      
      {recentScores.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">Recent Scores</h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {formattedScores.map((score, index) => (
              <li 
                key={`${score.timestamp}-${index}`} 
                className="flex items-center justify-between text-xs sm:text-sm p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-slate-200/50 dark:bg-slate-700/30 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{score.score}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{score.formattedDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 