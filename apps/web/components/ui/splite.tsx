'use client'

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  // Convert prod.spline.design/.../scene.splinecode to my.spline.design/.../
  const embedUrl = scene.replace('prod.spline.design', 'my.spline.design').replace('/scene.splinecode', '/');

  return (
    <iframe
      src={embedUrl}
      frameBorder="0"
      width="100%"
      height="100%"
      className={className}
      title="Spline 3D Scene"
      style={{ pointerEvents: 'auto' }}
    />
  )
}
