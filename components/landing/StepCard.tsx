interface StepCardProps {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

export default function StepCard({
  number,
  title,
  description,
  icon,
}: StepCardProps) {
  return (
    <div className="relative">
      <div className="rounded-lg bg-white p-8 shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blood-600 text-white font-bold">
          {number}
        </div>
        <div className="mb-3 flex h-10 w-10 items-center justify-center text-blood-600 text-2xl">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  )
}
