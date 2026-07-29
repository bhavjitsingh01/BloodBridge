import {
  Heart,
  Droplets,
  Building2,
  AlertTriangle,
  Brain,
  Map,
  BarChart3,
  LogOut,
} from 'lucide-react'

export interface NavLink {
  label: string
  href: string
  icon: React.ReactNode
  description?: string
}

export interface RoleNavigation {
  role: string
  dashboards: NavLink[]
  admin?: NavLink[]
}

export const roleNavigations: Record<string, RoleNavigation> = {
  donor: {
    role: 'Blood Donor',
    dashboards: [
      {
        label: 'Donor Dashboard',
        href: '/donor',
        icon: Heart,
        description: 'Manage your donations',
      },
      {
        label: 'Emergency Coordination',
        href: '/emergency-coordination',
        icon: AlertTriangle,
        description: 'Emergency requests',
      },
      {
        label: 'AI Predictions',
        href: '/ai-predictions',
        icon: Brain,
        description: 'Blood predictions',
      },
    ],
  },
  hospital: {
    role: 'Hospital Administrator',
    dashboards: [
      {
        label: 'Hospital Dashboard',
        href: '/hospital',
        icon: Building2,
        description: 'Hospital operations',
      },
      {
        label: 'Emergency Coordination',
        href: '/emergency-coordination',
        icon: AlertTriangle,
        description: 'Emergency requests',
      },
      {
        label: 'AI Predictions',
        href: '/ai-predictions',
        icon: Brain,
        description: 'Blood predictions',
      },
    ],
  },
  bloodBank: {
    role: 'Blood Bank Manager',
    dashboards: [
      {
        label: 'Blood Bank Dashboard',
        href: '/blood-bank',
        icon: Droplets,
        description: 'Inventory management',
      },
      {
        label: 'Emergency Coordination',
        href: '/emergency-coordination',
        icon: AlertTriangle,
        description: 'Emergency requests',
      },
      {
        label: 'AI Predictions',
        href: '/ai-predictions',
        icon: Brain,
        description: 'Blood predictions',
      },
    ],
  },
  admin: {
    role: 'Administrator',
    dashboards: [
      {
        label: 'Admin Dashboard',
        href: '/admin',
        icon: BarChart3,
        description: 'System overview',
      },
      {
        label: 'Intelligence Map',
        href: '/intelligence-map',
        icon: Map,
        description: 'Regional insights',
      },
      {
        label: 'Emergency Coordination',
        href: '/emergency-coordination',
        icon: AlertTriangle,
        description: 'Emergency requests',
      },
      {
        label: 'AI Predictions',
        href: '/ai-predictions',
        icon: Brain,
        description: 'Blood predictions',
      },
    ],
  },
}

export function getNavigationForRole(role: 'donor' | 'hospital' | 'bloodBank' | 'admin') {
  return roleNavigations[role]
}

export const allDashboards: NavLink[] = [
  {
    label: 'Donor Dashboard',
    href: '/donor',
    icon: Heart,
    description: 'Donation management',
  },
  {
    label: 'Hospital Dashboard',
    href: '/hospital',
    icon: Building2,
    description: 'Hospital operations',
  },
  {
    label: 'Blood Bank Dashboard',
    href: '/blood-bank',
    icon: Droplets,
    description: 'Inventory management',
  },
  {
    label: 'Emergency Coordination',
    href: '/emergency-coordination',
    icon: AlertTriangle,
    description: 'Real-time coordination',
  },
  {
    label: 'AI Predictions',
    href: '/ai-predictions',
    icon: Brain,
    description: 'Predictive analytics',
  },
  {
    label: 'Admin Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'System overview',
  },
  {
    label: 'Intelligence Map',
    href: '/intelligence-map',
    icon: Map,
    description: 'Regional insights',
  },
]
