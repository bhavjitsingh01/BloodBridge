'use client'

import { useState, useEffect } from 'react'
import { Heart, Bell, Trash2, Check, Clock, AlertCircle, History, Loader, CheckCircle, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { formatDateTime } from '@/lib/dateUtils'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" /> },
  { label: 'History', href: '/donor/history', icon: <History className="h-5 w-5" /> },
  { label: 'Notifications', href: '/donor/notifications', icon: <Bell className="h-5 w-5" />, isActive: true },
]

interface Notification {
  id: string
  _id?: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt?: string
}

export default function DonorNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getNotifications({ limit: 100 })
      setNotifications(result.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id)
      setNotifications(notifications.map(n =>
        n.id === id || n._id === id ? { ...n, read: true } : n
      ))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteNotification(id)
      setNotifications(notifications.filter(n => n.id !== id && n._id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete notification')
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await Promise.all(notifications.map(n => apiClient.deleteNotification(n.id || n._id || '')))
        setNotifications([])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete notifications')
      }
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filterStatus === 'unread') return !notif.read
    if (filterStatus === 'read') return notif.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length
  const urgentCount = notifications.filter(n => n.type === 'emergency' || n.type === 'urgent').length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-5 w-5" />
      case 'urgent':
        return <AlertCircle className="h-5 w-5" />
      case 'request':
        return <Clock className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-200'
      case 'urgent':
        return 'bg-amber-50 border-amber-200'
      case 'request':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Blood donation requests and important updates"
        userRole="Blood Donor"
        navItems={navItems}
      >
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blood-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Blood donation requests and important updates"
      userRole="Blood Donor"
      navItems={navItems}
    >
      {error && (
        <Alert type="danger" title="Error" message={error} className="mb-6" />
      )}

      {urgentCount > 0 && (
        <Alert
          type="danger"
          title="Urgent Notifications"
          message={`You have ${urgentCount} urgent or emergency notifications`}
          className="mb-6"
        />
      )}

      {/* Summary Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blood-600" />
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">{readCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Urgent/Emergency</p>
              <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Actions */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Notifications</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" /> Mark All as Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button size="sm" variant="danger" onClick={handleDeleteAll}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete All
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Notifications {filteredNotifications.length > 0 && `(${filteredNotifications.length})`}
        </h2>

        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id || notif._id}
                className={`rounded-lg border p-4 flex gap-4 items-start ${getNotificationColor(notif.type)} ${
                  !notif.read ? 'ring-2 ring-blood-500' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1 text-gray-600">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-gray-900 ${!notif.read ? 'font-bold' : ''}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notif.createdAt ? formatDateTime(notif.createdAt) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!notif.read && (
                    <Badge variant="info" className="whitespace-nowrap">
                      Unread
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    {!notif.read && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkAsRead(notif.id || notif._id || '')}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(notif.id || notif._id || '')}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications to display</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
