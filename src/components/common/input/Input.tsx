import { InputHTMLAttributes, ReactNode, useId } from 'react'
import './input.css'

type InputProps = {
  label?: ReactNode
  error?: ReactNode
  helperText?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export default function Input({
  label,
  error,
  helperText,
  id,
  required,
  disabled,
  className,
  ...rest
}: InputProps) {
  const uid = useId()
  const inputId = id || `in-${uid}`
  const helpId = helperText ? `${inputId}-help` : undefined

  return (
    <div className={["field", className || ""].filter(Boolean).join(" ")}> 
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
          {required ? <span aria-hidden> *</span> : null}
        </label>
      )}
      <input
        id={inputId}
        className={"field-input"}
        aria-invalid={!!error || undefined}
        aria-describedby={helpId}
        disabled={disabled}
        required={required}
        {...rest}
      />
      {helperText && (
        <div id={helpId} className="field-help">{helperText}</div>
      )}
      {error && <div className="field-error" role="alert">{error}</div>}
    </div>
  )
}