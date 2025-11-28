"use client"

import { useState } from "react"
import StartScreen from "./start-screen"
import DrawingCanvas from "./drawing-canvas"
import ResultScreen from "./result-screen"
import ScoreDisplay from "./score-display"
import ThemeToggle from "./theme-toggle"
import { saveScore } from "@/lib/score-storage"

export type GameState = "start" | "drawing" | "result"

export default function PerfectCircle() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [score, setScore] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])

  const startGame = () => {
    setGameState("drawing")
    setPoints([])
    setScore(0)
  }

  const endGame = (calculatedScore: number) => {
    // Validate score is a finite number
    if (!Number.isFinite(calculatedScore) || calculatedScore < 0 || calculatedScore > 1) {
      console.error('Invalid score received:', calculatedScore)
      return
    }
    
    const roundedScore = Math.round(calculatedScore * 100)
    
    // Ensure rounded score is within valid range
    const validScore = Math.max(0, Math.min(100, roundedScore))
    setScore(validScore)
    
    // Save the score to localStorage
    saveScore(validScore)
    
    setGameState("result")
  }

  const resetGame = () => {
    setGameState("start")
    setPoints([])
    setScore(0)
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center justify-center min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <header className="w-full py-4 sm:py-5 md:py-6 px-4 sm:px-5 md:px-6 flex justify-between items-center mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
          PERFECT CIRCLE
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {gameState === "start" && <ScoreDisplay />}
        </div>
      </header>

      <div className="w-full flex-1 flex items-center justify-center">
        {gameState === "start" && <StartScreen onStart={startGame} />}
        {gameState === "drawing" && (
          <DrawingCanvas
            onComplete={endGame}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            points={points}
            setPoints={setPoints}
          />
        )}
        {gameState === "result" && (
          <ResultScreen 
            score={score / 100} 
            onReset={resetGame} 
            onTryAgain={startGame} 
          />
        )}
      </div>
    </div>
  )
}

