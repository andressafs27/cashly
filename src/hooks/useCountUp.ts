import { useState, useEffect, useRef } from 'react'

/**
 * Anima um número de 0 até `target` usando easing ease-out cubic.
 * Re-anima sempre que `target` muda.
 */
export function useCountUp(target: number, duration = 850): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(target * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(animate)

    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])

  return value
}
