import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        hover && 'transition-all hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {children}
    </div>
  )
}
