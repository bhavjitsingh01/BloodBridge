interface RoleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  color: 'blood' | 'blue' | 'amber' | 'purple'
}

const colorClasses = {
  blood: 'bg-blood-50 border-blood-200 text-blood-600',
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
}

export default function RoleCard({
  icon,
  title,
  description,
  features,
  color,
}: RoleCardProps) {
  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl">
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      <ul className="mt-6 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className={`text-${color}-600 mt-1`}>✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
