/**
 * Calculate how circular a set of points is (0-1 scale)
 * 1 = perfect circle, 0 = not circular at all
 * Compares against a reference circle
 */
export function calculateCircularity(
  points: { x: number; y: number }[],
  referenceCircle?: { x: number; y: number; radius: number }
): number {
  if (points.length < 10) return 0

  // If we have a reference circle, use it for more accurate scoring
  if (referenceCircle) {
    return calculateCircularityAgainstReference(points, referenceCircle)
  }

  // Otherwise, use general circularity detection
  // Find the center of the shape
  const center = findCenter(points)

  // Calculate the average distance from center to all points
  const distances = points.map((point) => {
    // Validate point coordinates
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      return 0
    }
    return Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
  })
  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length

  if (!Number.isFinite(avgRadius) || avgRadius < 10) return 0 // Too small to be meaningful or invalid

  // 1. Radius consistency (0-1) - how uniform the radius is
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length
  const stdDev = Math.sqrt(variance)
  // Prevent division by zero
  const radiusScore = avgRadius > 0 && Number.isFinite(stdDev / avgRadius)
    ? Math.max(0, 1 - (stdDev / avgRadius) * 2)
    : 0

  // 2. Path smoothness (0-1)
  const smoothnessScore = calculateSmoothnessScore(points)

  // 3. Shape closure (0-1) - how well the start and end connect
  const startPoint = points[0]
  const endPoint = points[points.length - 1]
  const closureDistance = Math.sqrt(
    Math.pow(startPoint.x - endPoint.x, 2) + 
    Math.pow(startPoint.y - endPoint.y, 2)
  )
  // Prevent division by zero
  const closureScore = avgRadius > 0 && Number.isFinite(closureDistance / (avgRadius * 0.3))
    ? Math.max(0, 1 - closureDistance / (avgRadius * 0.3))
    : 0

  // Weighted average of all scores
  const weights = {
    radius: 0.5,
    smoothness: 0.3,
    closure: 0.2
  }

  const finalScore = 
    radiusScore * weights.radius +
    smoothnessScore * weights.smoothness +
    closureScore * weights.closure

  return Math.min(1, Math.max(0, finalScore))
}

/**
 * Calculate circularity by comparing against a reference circle
 */
function calculateCircularityAgainstReference(
  points: { x: number; y: number }[],
  refCircle: { x: number; y: number; radius: number }
): number {
  // Check closure first
  const startPoint = points[0]
  const endPoint = points[points.length - 1]
  const closureDistance = Math.sqrt(
    Math.pow(startPoint.x - endPoint.x, 2) + 
    Math.pow(startPoint.y - endPoint.y, 2)
  )
  
  // More forgiving closure check
  if (closureDistance > refCircle.radius * 0.4) {
    return 0
  }

  // Calculate how close each point is to the reference circle
  const deviations = points.map(point => {
    // Validate point coordinates
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      return 1 // Maximum deviation for invalid points
    }
    const distToCenter = Math.sqrt(
      Math.pow(point.x - refCircle.x, 2) + 
      Math.pow(point.y - refCircle.y, 2)
    )
    // Normalized deviation (0 = perfect, 1 = way off)
    // Prevent division by zero
    if (refCircle.radius <= 0 || !Number.isFinite(distToCenter)) {
      return 1
    }
    return Math.abs(distToCenter - refCircle.radius) / refCircle.radius
  })
  
  // Average deviation
  const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length
  
  // Convert to score with better curve
  // Use a more forgiving scoring curve
  const score = Math.max(0, 1 - avgDeviation * 1.5)
  
  // Apply smoothness bonus/penalty
  const smoothness = calculateSmoothnessScore(points)
  const finalScore = score * 0.8 + smoothness * 0.2
  
  return Math.min(1, Math.max(0, finalScore))
}

/**
 * Calculate how smooth the path is
 * A circle should have smooth transitions between points
 */
function calculateSmoothnessScore(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0
  
  let totalAngleChange = 0
  let validAngles = 0
  
  // Sample points to avoid over-weighting dense areas
  const step = Math.max(1, Math.floor(points.length / 50))
  
  for (let i = step; i < points.length - step; i += step) {
    const prev = points[i - step]
    const curr = points[i]
    const next = points[i + step]
    
    if (!prev || !curr || !next) continue
    
    // Calculate vectors
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y }
    const v2 = { x: next.x - curr.x, y: next.y - curr.y }
    
    // Calculate angle between vectors
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    
    if (mag1 < 0.1 || mag2 < 0.1 || !Number.isFinite(mag1) || !Number.isFinite(mag2)) continue
    
    // Prevent division by zero
    const denominator = mag1 * mag2
    if (denominator === 0 || !Number.isFinite(denominator)) continue
    
    const cosAngle = Math.min(1, Math.max(-1, dot / denominator))
    const angle = Math.acos(cosAngle)
    totalAngleChange += angle
    validAngles++
  }
  
  if (validAngles === 0 || points.length === 0) return 0
  
  // Expected angle change for a circle (approximately 2π)
  // For a smooth circle, each segment should contribute roughly the same angle
  const expectedAngle = (Math.PI * 2 * validAngles) / points.length
  const actualAngle = totalAngleChange
  
  // Prevent division by zero
  if (!Number.isFinite(expectedAngle) || expectedAngle === 0) return 0
  
  // More forgiving smoothness check
  const deviation = Math.abs(actualAngle - expectedAngle) / expectedAngle
  return Number.isFinite(deviation) ? Math.max(0, 1 - deviation * 0.5) : 0
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