import { useMemo } from 'react'
import './avatar.css'

type AvatarProps = {
  src?: string
  alt: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  status?: 'online' | 'offline' | 'busy' | 'none'
}

export default function Avatar({ src, alt, fallback, size = 'md', status = 'none' }: AvatarProps) {
  const initials = useMemo(() => {
    if (fallback) return fallback
    const parts = alt.trim().split(' ')
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
  }, [alt, fallback])
  const classes = ['avatar', `avatar-${size}`, status !== 'none' ? `avatar-${status}` : ''].filter(Boolean).join(' ')
  return (
    <span className={classes} aria-label={alt} role="img">
      {src ? <img src={src} alt={alt} /> : <span className="avatar-fallback" aria-hidden>{initials}</span>}
    </span>
  )
}