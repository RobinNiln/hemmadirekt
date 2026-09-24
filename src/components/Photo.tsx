import { useState } from 'react'
import { Home } from 'lucide-react'
import { cn } from './ui'

// Visar en bild. Om bilden inte går att ladda visas en lugn reservyta med husikon,
// så att sidan aldrig ser trasig ut.
export function Photo({ src, alt, className, eager, rotation = 0 }: { src: string; alt: string; className?: string; eager?: boolean; rotation?: number }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (failed || !src) {
    return (
      <div className={cn('flex items-center justify-center bg-gradient-to-br from-petrol-100 via-sand-200 to-mint-100', className)} role="img" aria-label={alt}>
        <Home className="h-10 w-10 text-petrol-300" strokeWidth={1.5} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      style={rotation ? { transform: `rotate(${rotation}deg)${rotation % 180 ? ' scale(1.34)' : ''}` } : undefined}
      className={cn('bg-sand-200 object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  )
}
