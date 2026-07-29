import Link from 'next/link'
import { Heart } from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

interface SidebarProps {
  title: string
  items: NavItem[]
  userRole: string
}

export default function Sidebar({ title, items, userRole }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-blood-600" />
          <div>
            <p className="font-semibold text-gray-900">BloodBridge</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              item.isActive
                ? 'bg-blood-50 text-blood-600'
                : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <span className="h-5 w-5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p className="font-semibold text-gray-900">User Role</p>
          <p className="text-gray-600">{userRole}</p>
        </div>
      </div>
    </aside>
  )
}
