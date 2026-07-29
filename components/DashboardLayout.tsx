import Sidebar from './Sidebar'
import Header from './Header'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  userRole: string
  navItems: NavItem[]
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  userRole,
  navItems,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar title={userRole} items={navItems} userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
