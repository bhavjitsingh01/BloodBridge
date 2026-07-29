import { Bell, User, Settings } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  userInitials?: string
}

export default function Header({ title, subtitle, userInitials = 'U' }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blood-600"></span>
          </button>

          <button className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blood-600 text-white hover:bg-blood-700">
            <User className="h-5 w-5" />
          </button>

          <span className="text-sm font-medium text-gray-700">{userInitials}</span>
        </div>
      </div>
    </header>
  )
}
