"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { calculateCircularity } from "@/lib/circle-utils"

interface DrawingCanvasProps {
  onComplete: (score: number) => void
  isDrawing: boolean
  setIsDrawing: (isDrawing: boolean) => void
  points: { x: number; y: number }[]
  setPoints: (points: { x: number; y: number }[]) => void
}

export default function DrawingCanvas({ onComplete, isDrawing, setIsDrawing, points, setPoints }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  const [feedback, setFeedback] = useState("")
  const [referenceCircle, setReferenceCircle] = useState({ x: 0, y: 0, radius: 0 })

  // Set up canvas and resize handler
  useEffect(() => {
    const handleResize = () => {
      const size = Math.min(window.innerWidth - 40, 600)
      setCanvasSize({ width: size, height: size })
      
      // Set reference circle based on canvas size
      const centerX = size / 2
      const centerY = size / 2
      const radius = size * 0.35 // 35% of canvas size
      setReferenceCircle({ x: centerX, y: centerY, radius })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Draw current state to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw reference point (white dot in center)
    ctx.beginPath()
    ctx.arc(referenceCircle.x, referenceCircle.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = "white"
    ctx.fill()

    // Draw points
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      ctx.strokeStyle = "rgba(120, 255, 120, 0.8)"
      ctx.lineWidth = 8
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    }
  }, [points, canvasSize, referenceCircle])

  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setPoints([])
    setTimeout(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const newX = e.clientX - rect.left
        const newY = e.clientY - rect.top
        setPoints([{ x: newX, y: newY }])
      }
    }, 0)
    setFeedback("")
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Only add the point if we already have at least one point
    if (points.length > 0) {
      setPoints([...points, { x, y }])
    } else {
      setPoints([{ x, y }])
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    // Check if we have enough points to evaluate
    if (points.length < 20) {
      setFeedback("Draw a complete circle")
      setPoints([])
      return
    }

    // Calculate how well the user traced the reference circle
    const score = calculateScoreFromReference(points, referenceCircle)

    // Complete the game with the score
    onComplete(score)
  }

  // Calculate score by comparing user's drawing to the reference circle
  const calculateScoreFromReference = (
    points: { x: number; y: number }[], 
    refCircle: { x: number; y: number; radius: number }
  ): number => {
    // First check if the circle is closed - if not, it's not a circle
    const startPoint = points[0]
    const endPoint = points[points.length - 1]
    const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2))
    
    // If the start and end are too far apart, it's not a circle
    if (distance > refCircle.radius * 0.2) {
      return 0 // Not closed, not a circle
    }
    
    // Calculate how close each point is to the reference circle radius
    const distanceDeviations = points.map(point => {
      const distToCenter = Math.sqrt(
        Math.pow(point.x - refCircle.x, 2) + 
        Math.pow(point.y - refCircle.y, 2)
      )
      // Calculate deviation from the reference radius as a percentage
      return Math.abs(distToCenter - refCircle.radius) / refCircle.radius
    })
    
    // Average deviation (lower is better)
    const avgDeviation = distanceDeviations.reduce((sum, dev) => sum + dev, 0) / distanceDeviations.length
    
    // Convert to a score (0-1) - make it fairly easy (multiplier 0.8 instead of 2)
    return Math.max(0, 1 - avgDeviation * 0.8)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-10 flex items-center justify-center">
        {feedback && <p className="text-xl text-yellow-400">{feedback}</p>}
        {!isDrawing && !feedback && <p className="text-xl">Draw a circle around the dot</p>}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-2 border-gray-700 rounded-lg bg-black touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
}

