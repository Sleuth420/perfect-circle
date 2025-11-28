"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { calculateCircularity } from "@/lib/circle-utils"

interface DrawingCanvasProps {
  onComplete: (score: number) => void
  isDrawing: boolean
  setIsDrawing: (isDrawing: boolean) => void
  points: { x: number; y: number }[]
  setPoints: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>
}

export default function DrawingCanvas({ onComplete, isDrawing, setIsDrawing, points, setPoints }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  const [feedback, setFeedback] = useState("")
  const [referenceCircle, setReferenceCircle] = useState({ x: 0, y: 0, radius: 0 })
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Set up canvas and resize handler with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | undefined
    
    const handleResize = () => {
      // Debounce resize to avoid excessive recalculations
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      resizeTimeout = setTimeout(() => {
        // Responsive sizing: smaller on mobile, larger on desktop
        const maxSize = window.innerWidth < 640 ? 320 : window.innerWidth < 1024 ? 480 : 600
        const padding = window.innerWidth < 640 ? 20 : 40
        const size = Math.min(window.innerWidth - padding, maxSize)
        setCanvasSize({ width: size, height: size })
        
        // Set reference circle based on canvas size
        const centerX = size / 2
        const centerY = size / 2
        const radius = size * 0.35 // 35% of canvas size
        setReferenceCircle({ x: centerX, y: centerY, radius })
      }, 150) // 150ms debounce
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Track theme changes for canvas redraw
  const [themeClass, setThemeClass] = useState(() => 
    typeof document !== 'undefined' ? document.documentElement.className : ''
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeClass(document.documentElement.className)
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  // Draw current state to canvas with smooth rendering
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw reference circle (subtle guide) - theme aware
      const isDark = document.documentElement.classList.contains("dark")
      ctx.beginPath()
      ctx.arc(referenceCircle.x, referenceCircle.y, referenceCircle.radius, 0, Math.PI * 2)
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw reference center point
      ctx.beginPath()
      ctx.arc(referenceCircle.x, referenceCircle.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
      ctx.fill()
      
      // Draw glow effect for center
      ctx.beginPath()
      ctx.arc(referenceCircle.x, referenceCircle.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
      ctx.fill()

      // Draw user's path with smooth gradient - theme aware
      if (points.length > 1) {
        // Create gradient based on progress - adjust opacity for light mode
        const gradient = ctx.createLinearGradient(
          points[0].x, points[0].y,
          points[points.length - 1].x, points[points.length - 1].y
        )
        if (isDark) {
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.9)") // green-500
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.9)") // blue-500
          gradient.addColorStop(1, "rgba(168, 85, 247, 0.9)") // purple-500
        } else {
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.95)") // emerald-500 - brighter for light mode
          gradient.addColorStop(0.5, "rgba(37, 99, 235, 0.95)") // blue-600 - brighter for light mode
          gradient.addColorStop(1, "rgba(147, 51, 234, 0.95)") // purple-600 - brighter for light mode
        }

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        // Optimize drawing for large point arrays by sampling points
        // For very large arrays, draw every Nth point to maintain performance
        const pointStep = points.length > 500 ? Math.ceil(points.length / 500) : 1
        
        // Use quadratic curves for smoother lines
        for (let i = 1; i < points.length; i += pointStep) {
          const prev = points[Math.max(0, i - pointStep)]
          const curr = points[i]
          
          if (i === 1 || i === pointStep) {
            ctx.lineTo(curr.x, curr.y)
          } else {
            const midX = (prev.x + curr.x) / 2
            const midY = (prev.y + curr.y) / 2
            ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
          }
        }
        
        // Always draw to the last point for completeness
        if (points.length > 2) {
          const lastPoint = points[points.length - 1]
          ctx.lineTo(lastPoint.x, lastPoint.y)
        }

        ctx.strokeStyle = gradient
        ctx.lineWidth = 6
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.shadowBlur = 10
        ctx.shadowColor = isDark ? "rgba(34, 197, 94, 0.5)" : "rgba(16, 185, 129, 0.4)"
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [points, canvasSize, referenceCircle, themeClass])

  // Optimized point sampling - only add points if they're far enough from the last point
  const addPoint = useCallback((x: number, y: number) => {
    // Validate coordinates are finite numbers
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return
    }
    
    // Validate coordinates are within reasonable bounds (canvas size + some margin)
    const maxCoord = Math.max(canvasSize.width, canvasSize.height) * 2
    if (Math.abs(x) > maxCoord || Math.abs(y) > maxCoord) {
      return
    }
    
    const minDistance = 3 // Minimum pixels between points
    
    if (lastPointRef.current) {
      const dx = x - lastPointRef.current.x
      const dy = y - lastPointRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < minDistance) {
        return // Skip this point, too close to the last one
      }
    }
    
    // Limit points array size to prevent unbounded growth (max 2000 points)
    setPoints((prev) => {
      const newPoints = [...prev, { x, y }]
      // Keep only the most recent 2000 points if exceeded
      return newPoints.length > 2000 ? newPoints.slice(-2000) : newPoints
    })
    
    lastPointRef.current = { x, y }
  }, [setPoints, canvasSize])

  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setIsDrawing(true)
    setPoints([])
    lastPointRef.current = null
    setFeedback("")
    
    // Add first point
    setPoints([{ x, y }])
    lastPointRef.current = { x, y }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    addPoint(x, y)
  }

  const handlePointerUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    lastPointRef.current = null

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    // Check if we have enough points to evaluate
    if (points.length < 10) {
      setFeedback("Draw a complete circle around the guide")
      timeoutRef.current = setTimeout(() => {
        setPoints([])
        timeoutRef.current = undefined
      }, 1000)
      return
    }

    // Use the improved circularity calculation
    const score = calculateCircularity(points, referenceCircle)

    // Validate score is a finite number before completing
    if (Number.isFinite(score) && score >= 0 && score <= 1) {
      onComplete(score)
    } else {
      console.warn('Invalid score calculated:', score)
      setFeedback("Error calculating score. Please try again.")
      timeoutRef.current = setTimeout(() => {
        setPoints([])
        timeoutRef.current = undefined
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="h-10 sm:h-12 flex items-center justify-center min-h-[2.5rem] sm:min-h-[3rem] px-2">
        {feedback && (
          <p className="text-base sm:text-lg md:text-xl text-amber-500 dark:text-amber-400 animate-pulse font-medium text-center">{feedback}</p>
        )}
        {!isDrawing && !feedback && (
          <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium text-center">
            Draw a circle around the guide
          </p>
        )}
        {isDrawing && points.length > 0 && (
          <p className="text-base sm:text-lg text-emerald-500 dark:text-emerald-400 font-medium text-center">
            Keep going... {Math.min(100, Math.round((points.length / 100) * 100))}%
          </p>
        )}
      </div>
      <div className="relative w-full max-w-full">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-2 border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 touch-none shadow-2xl shadow-slate-900/20 dark:shadow-slate-900/50 w-full max-w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {isDrawing && points.length > 5 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-2xl font-bold text-emerald-500/30 dark:text-emerald-400/30 animate-pulse">
              {Math.min(100, Math.round((points.length / 100) * 100))}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

