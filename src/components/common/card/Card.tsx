import { HTMLAttributes } from 'react'
import './card.css'

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card" {...props} />
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card-header" {...props} />
}

export function CardBody(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card-body" {...props} />
}

export function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card-footer" {...props} />
}