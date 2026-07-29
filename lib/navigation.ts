import type { LucideIcon } from 'lucide-react'

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface RoleNavigation {
  role: string
  dashboards: NavLink[]
  admin?: NavLink[]
}

export const dashboardRoutes = {
  donor: {
    href: '/donor',
    label: 'Donor Dashboard',
    icon: 'Heart',
  },
  hospital: {
    href: '/hospital',
    label: 'Hospital Dashboard',
    icon: 'Building2',
  },
  bloodBank: {
    href: '/blood-bank',
    label: 'Blood Bank Dashboard',
    icon: 'Droplets',
  },
  emergency: {
    href: '/emergency-coordination',
    label: 'Emergency Coordination',
    icon: 'AlertTriangle',
  },
  aiPredictions: {
    href: '/ai-predictions',
    label: 'AI Predictions',
    icon: 'Brain',
  },
  admin: {
    href: '/admin',
    label: 'Admin Dashboard',
    icon: 'BarChart3',
  },
  map: {
    href: '/intelligence-map',
    label: 'Intelligence Map',
    icon: 'Map',
  },
}
