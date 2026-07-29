import Card from './Card'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color?: 'blood' | 'blue' | 'amber' | 'green'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

const colorClasses = {
  blood: 'bg-blood-50 text-blood-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'blood',
  trend,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-lg text-gray-600"> {unit}</span>}
          </p>
          {trend && (
            <p
              className={clsx(
                'mt-2 text-sm font-medium',
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={clsx('rounded-lg p-3', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
