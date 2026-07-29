interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blood-300">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blood-50 text-blood-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600">{description}</p>
    </div>
  )
}
