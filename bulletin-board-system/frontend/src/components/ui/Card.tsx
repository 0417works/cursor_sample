import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'bg-white overflow-hidden shadow rounded-lg border border-gray-200',
      className
    )}>
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-4 py-5 sm:px-6 border-b border-gray-200',
      className
    )}>
      {children}
    </div>
  )
}

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-4 py-5 sm:p-6',
      className
    )}>
      {children}
    </div>
  )
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50',
      className
    )}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardBody, CardFooter }
export default Card
