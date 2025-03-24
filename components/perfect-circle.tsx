"use client"

import { useState, useEffect } from "react"
import StartScreen from "./start-screen"
import DrawingCanvas from "./drawing-canvas"
import ResultScreen from "./result-screen"
import ScoreDisplay from "./score-display"
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
    const roundedScore = Math.round(calculatedScore * 100)
    setScore(roundedScore)
    
    // Save the score to localStorage
    saveScore(roundedScore)
    
    setGameState("result")
  }

  const resetGame = () => {
    setGameState("start")
    setPoints([])
    setScore(0)
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center justify-center">
      <header className="w-full py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider">PERFECT CIRCLE</h1>
        {gameState === "start" && <ScoreDisplay />}
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
        {gameState === "result" && <ResultScreen score={score/100} onReset={resetGame} onTryAgain={startGame} />}
      </div>
    </div>
  )
}

