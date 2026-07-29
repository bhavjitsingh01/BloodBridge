interface SectionHeaderProps {
  title: string
  subtitle: string
  centered?: boolean
}

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg text-gray-600 md:text-xl">
        {subtitle}
      </p>
    </div>
  )
}
