import './badge.css'

type Variant = 'neutral' | 'success' | 'warning' | 'danger'
type Tone = 'soft' | 'solid'

type BadgeProps = {
  variant?: Variant
  tone?: Tone
  children: React.ReactNode
}

export default function Badge({ variant = 'neutral', tone = 'soft', children }: BadgeProps) {
  const classes = ['badge', `badge-${variant}`, `badge-${tone}`].join(' ')
  return <span className={classes}>{children}</span>
}