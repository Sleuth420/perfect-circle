/**
 * Calculate how circular a set of points is (0-1 scale)
 * 1 = perfect circle, 0 = not circular at all
 */
export function calculateCircularity(points: { x: number; y: number }[]): number {
  if (points.length < 20) return 0

  // Find the center of the shape
  const center = findCenter(points)

  // Calculate the average distance from center to all points
  const distances = points.map((point) => Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)))
  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length

  // 1. Radius consistency (0-1)
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length
  const stdDev = Math.sqrt(variance)
  const radiusScore = Math.max(0, 1 - stdDev / avgRadius)

  // 2. Path smoothness (0-1)
  const smoothnessScore = calculateSmoothnessScore(points)

  // 3. Shape closure (0-1)
  const startPoint = points[0]
  const endPoint = points[points.length - 1]
  const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2))
  const closureScore = Math.max(0, 1 - distance / (avgRadius * 0.5))

  // Weighted average of all scores
  const weights = {
    radius: 0.6,
    smoothness: 0.3,
    closure: 0.1
  }

  const finalScore = 
    radiusScore * weights.radius +
    smoothnessScore * weights.smoothness +
    closureScore * weights.closure

  return Math.min(1, Math.max(0, finalScore))
}

/**
 * Calculate how smooth the path is
 * A circle should have smooth transitions between points
 */
function calculateSmoothnessScore(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0
  
  let totalAngleChange = 0
  
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length]
    const curr = points[i]
    const next = points[(i + 1) % points.length]
    
    if (!prev || !curr || !next) continue
    
    // Calculate vectors
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y }
    const v2 = { x: next.x - curr.x, y: next.y - curr.y }
    
    // Calculate angle between vectors
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    
    if (mag1 === 0 || mag2 === 0) continue
    
    const cosAngle = Math.min(1, Math.max(-1, dot / (mag1 * mag2)))
    const angle = Math.acos(cosAngle)
    totalAngleChange += angle
  }
  
  // In a perfect circle, the total angle change should be 2π
  return Math.max(0, 1 - Math.abs(totalAngleChange - Math.PI * 2) / (Math.PI * 2))
}

/**
 * Find the center point of a set of points
 */
function findCenter(points: { x: number; y: number }[]): { x: number; y: number } {
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  }
}