import './loading.css'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
  label?: string
}

export default function Spinner({ size = 'md', inline, label }: SpinnerProps) {
  const classes = [
    'spinner',
    `spinner-${size}`,
    inline ? 'spinner-inline' : 'spinner-block',
  ].join(' ')
  return (
    <div className={classes} role="status" aria-live="polite">
      <span className="spinner-circle" aria-hidden />
      {label ? <span className="spinner-label">{label}</span> : null}
    </div>
  )
}