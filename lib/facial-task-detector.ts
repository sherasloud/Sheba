// Facial Task Detection Library
// Detects 5 liveness tasks: Blink, Smile, Focus, Turn Left, Turn Right

export type FacialTask = 'blink' | 'smile' | 'focus' | 'turn_left' | 'turn_right'

export interface FacialTaskResult {
  completed: boolean
  confidence: number
  message: string
}

export class FacialTaskDetector {
  private blinkThreshold = 0.3
  private smileThreshold = 0.5
  private focusThreshold = 0.7
  private turnAngleThreshold = 20 // degrees

  // Detect blink - eyes should close and open
  detectBlink(faceData: any): FacialTaskResult {
    try {
      if (!faceData?.landmarks) {
        return { completed: false, confidence: 0, message: 'Face not detected' }
      }

      // Eye landmarks: top-left, top-right, bottom-right, bottom-left
      const leftEye = faceData.landmarks.slice(36, 42)
      const rightEye = faceData.landmarks.slice(42, 48)

      // Calculate eye aspect ratio (EAR)
      const leftEAR = this.calculateEyeAspectRatio(leftEye)
      const rightEAR = this.calculateEyeAspectRatio(rightEye)
      const averageEAR = (leftEAR + rightEAR) / 2

      // Eyes closed if EAR < threshold
      const eyesClosed = averageEAR < this.blinkThreshold
      const confidence = eyesClosed ? 0.9 : 0

      return {
        completed: eyesClosed,
        confidence,
        message: eyesClosed ? 'Blink detected!' : 'Please blink your eyes'
      }
    } catch (error) {
      console.error('[v0] Blink detection error:', error)
      return { completed: false, confidence: 0, message: 'Error detecting blink' }
    }
  }

  // Detect smile - mouth should be open and curved
  detectSmile(faceData: any): FacialTaskResult {
    try {
      if (!faceData?.landmarks) {
        return { completed: false, confidence: 0, message: 'Face not detected' }
      }

      // Mouth landmarks: 48-68
      const mouth = faceData.landmarks.slice(48, 68)

      // Calculate mouth opening ratio
      const mouthOpenRatio = this.calculateMouthOpenness(mouth)
      const mouthCurve = this.calculateMouthCurve(mouth)

      // Smile detected if mouth is open and curved
      const smileDetected = mouthOpenRatio > 0.3 && mouthCurve > 0.2
      const confidence = smileDetected ? 0.85 : mouthOpenRatio * 0.5

      return {
        completed: smileDetected,
        confidence,
        message: smileDetected ? 'Smile detected!' : 'Please smile at the camera'
      }
    } catch (error) {
      console.error('[v0] Smile detection error:', error)
      return { completed: false, confidence: 0, message: 'Error detecting smile' }
    }
  }

  // Detect face is centered and focused on camera
  detectFocus(faceData: any): FacialTaskResult {
    try {
      if (!faceData?.landmarks) {
        return { completed: false, confidence: 0, message: 'Face not detected' }
      }

      // Check if face is centered
      const faceBounds = this.getFaceBounds(faceData.landmarks)
      const centerX = faceBounds.centerX
      const centerY = faceBounds.centerY

      // Face should be roughly centered (40-60% horizontal, 30-70% vertical)
      const isCentered = centerX > 0.3 && centerX < 0.7 && centerY > 0.2 && centerY < 0.8

      // Check head tilt (should be minimal)
      const headTilt = Math.abs(this.calculateHeadTilt(faceData.landmarks))
      const isLevel = headTilt < 15 // degrees

      const focusDetected = isCentered && isLevel
      const confidence = focusDetected ? 0.9 : 0.3

      return {
        completed: focusDetected,
        confidence,
        message: focusDetected ? 'Perfect focus!' : 'Please look directly at the camera'
      }
    } catch (error) {
      console.error('[v0] Focus detection error:', error)
      return { completed: false, confidence: 0, message: 'Error detecting focus' }
    }
  }

  // Detect head turn to the left
  detectTurnLeft(faceData: any): FacialTaskResult {
    try {
      if (!faceData?.landmarks) {
        return { completed: false, confidence: 0, message: 'Face not detected' }
      }

      const headYaw = this.calculateHeadYaw(faceData.landmarks)

      // Head turned left if yaw > threshold (positive = left)
      const turnedLeft = headYaw > this.turnAngleThreshold
      const confidence = turnedLeft ? Math.min(headYaw / 45, 1) : 0

      return {
        completed: turnedLeft,
        confidence,
        message: turnedLeft ? 'Left turn detected!' : 'Please turn your head to the left'
      }
    } catch (error) {
      console.error('[v0] Turn left detection error:', error)
      return { completed: false, confidence: 0, message: 'Error detecting left turn' }
    }
  }

  // Detect head turn to the right
  detectTurnRight(faceData: any): FacialTaskResult {
    try {
      if (!faceData?.landmarks) {
        return { completed: false, confidence: 0, message: 'Face not detected' }
      }

      const headYaw = this.calculateHeadYaw(faceData.landmarks)

      // Head turned right if yaw < -threshold (negative = right)
      const turnedRight = headYaw < -this.turnAngleThreshold
      const confidence = turnedRight ? Math.min(Math.abs(headYaw) / 45, 1) : 0

      return {
        completed: turnedRight,
        confidence,
        message: turnedRight ? 'Right turn detected!' : 'Please turn your head to the right'
      }
    } catch (error) {
      console.error('[v0] Turn right detection error:', error)
      return { completed: false, confidence: 0, message: 'Error detecting right turn' }
    }
  }

  // Helper: Calculate eye aspect ratio (EAR)
  private calculateEyeAspectRatio(eye: any[]): number {
    if (eye.length < 6) return 1

    const p1 = eye[1]
    const p2 = eye[2]
    const p3 = eye[3]
    const p4 = eye[4]
    const p5 = eye[0]
    const p6 = eye[5]

    const verticalDist1 = this.distance(p1, p5)
    const verticalDist2 = this.distance(p2, p6)
    const horizontalDist = this.distance(p3, p4)

    return (verticalDist1 + verticalDist2) / (2 * horizontalDist)
  }

  // Helper: Calculate mouth openness
  private calculateMouthOpenness(mouth: any[]): number {
    if (mouth.length < 20) return 0

    const topLip = mouth.slice(12, 16)
    const bottomLip = mouth.slice(16, 20)

    let totalDistance = 0
    for (let i = 0; i < topLip.length; i++) {
      totalDistance += this.distance(topLip[i], bottomLip[i])
    }

    const mouthWidth = this.distance(mouth[0], mouth[6])
    return totalDistance / (4 * mouthWidth)
  }

  // Helper: Calculate mouth curve (smile indicator)
  private calculateMouthCurve(mouth: any[]): number {
    if (mouth.length < 20) return 0

    const mouthCornerLeft = mouth[0]
    const mouthCornerRight = mouth[6]
    const mouthTop = mouth[2]
    const mouthBottom = mouth[14]

    const topDist = Math.abs(mouthTop[1] - (mouthCornerLeft[1] + mouthCornerRight[1]) / 2)
    const bottomDist = Math.abs(mouthBottom[1] - (mouthCornerLeft[1] + mouthCornerRight[1]) / 2)

    return (topDist + bottomDist) / 50
  }

  // Helper: Get face bounding box
  private getFaceBounds(landmarks: any[]): any {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    landmarks.forEach(point => {
      if (point[0] < minX) minX = point[0]
      if (point[0] > maxX) maxX = point[0]
      if (point[1] < minY) minY = point[1]
      if (point[1] > maxY) maxY = point[1]
    })

    const width = maxX - minX
    const height = maxY - minY

    return {
      centerX: (minX + maxX) / (2 * 640), // Assuming 640px width
      centerY: (minY + maxY) / (2 * 480), // Assuming 480px height
      width,
      height
    }
  }

  // Helper: Calculate head tilt (roll)
  private calculateHeadTilt(landmarks: any[]): number {
    if (landmarks.length < 48) return 0

    const leftEye = this.getCenter(landmarks.slice(36, 42))
    const rightEye = this.getCenter(landmarks.slice(42, 48))

    const angle = Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0])
    return (angle * 180) / Math.PI
  }

  // Helper: Calculate head yaw (left-right rotation)
  private calculateHeadYaw(landmarks: any[]): number {
    if (landmarks.length < 48) return 0

    const noseTip = landmarks[30]
    const leftEye = this.getCenter(landmarks.slice(36, 42))
    const rightEye = this.getCenter(landmarks.slice(42, 48))

    const eyeCenter = [(leftEye[0] + rightEye[0]) / 2, (leftEye[1] + rightEye[1]) / 2]
    const noseToEyeX = noseTip[0] - eyeCenter[0]

    // Positive = head turned left, negative = head turned right
    return (noseToEyeX / 100) * 45 // Scale to degrees
  }

  // Helper: Calculate center point
  private getCenter(points: any[]): number[] {
    let x = 0, y = 0
    points.forEach(p => {
      x += p[0]
      y += p[1]
    })
    return [x / points.length, y / points.length]
  }

  // Helper: Calculate distance between two points
  private distance(p1: any, p2: any): number {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
  }
}
