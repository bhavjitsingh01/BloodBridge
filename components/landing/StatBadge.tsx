interface StatBadgeProps {
  number: string
  label: string
}

export default function StatBadge({ number, label }: StatBadgeProps) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-blood-600 md:text-5xl">{number}</p>
      <p className="mt-2 text-gray-600">{label}</p>
    </div>
  )
}
