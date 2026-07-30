'use client'

import { useState, useMemo } from 'react'
import { Heart, Calendar, Clock, MapPin, Plus, Edit2, X, Check } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { useApp } from '@/lib/AppContext'
import { useFormState, useValidation, useToast, useGenerateId } from '@/lib/hooks'
import { useAuth } from '@/lib/useAuth'

const navItems = [
  { label: 'Dashboard', href: '/donor', icon: <Heart className="h-5 w-5" />, isActive: true },
  { label: 'History', href: '/donor/history', icon: <Clock className="h-5 w-5" /> },
  { label: 'Notifications', href: '/donor/notifications', icon: <Heart className="h-5 w-5" /> },
]

interface DonorProfileFormData {
  name: string
  email: string
  phone: string
  bloodGroup: string
  age: string
  gender: string
  city: string
  state: string
}

interface AppointmentFormData {
  appointmentDate: string
  appointmentTime: string
  centerName: string
}

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const states = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Punjab', 'Gujarat']

export default function DonorDashboard() {
  const { user } = useAuth()
  const { donors, addDonor, updateDonor } = useApp()
  const { addToast } = useToast()
  const { validate } = useValidation()
  const generateId = useGenerateId()

  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([
    {
      id: 'apt-001',
      date: '2024-08-15',
      time: '10:00',
      center: 'City Blood Bank',
      status: 'Scheduled',
    },
  ])

  // Get current donor
  const currentDonor = useMemo(() => {
    return donors.find(d => d.email === user?.email) || {
      id: generateId('donor'),
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      bloodGroup: 'O+',
      age: 25,
      gender: 'Male',
      city: 'Delhi',
      state: 'Delhi',
      availability: 'Available',
    }
  }, [donors, user, generateId])

  const profileForm = useFormState<DonorProfileFormData>({
    name: currentDonor?.name || '',
    email: currentDonor?.email || '',
    phone: currentDonor?.phone || '',
    bloodGroup: currentDonor?.bloodGroup || 'O+',
    age: currentDonor?.age?.toString() || '25',
    gender: currentDonor?.gender || 'Male',
    city: currentDonor?.city || 'Delhi',
    state: currentDonor?.state || 'Delhi',
  })

  const appointmentForm = useFormState<AppointmentFormData>({
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    centerName: 'City Blood Bank',
  })

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    profileForm.setIsSubmitting(true)

    const rules = {
      name: { required: true, minLength: 2 },
      email: { required: true },
      phone: { required: true, minLength: 10 },
      bloodGroup: { required: true },
      age: { required: true, pattern: /^\d+$/ },
    }

    const errors = validate(profileForm.values, rules)
    if (Object.keys(errors).length > 0) {
      profileForm.setErrors(errors)
      profileForm.setIsSubmitting(false)
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      if (currentDonor?.id && donors.some(d => d.id === currentDonor.id)) {
        updateDonor(currentDonor.id, {
          name: profileForm.values.name,
          email: profileForm.values.email,
          phone: profileForm.values.phone,
          bloodGroup: profileForm.values.bloodGroup,
          age: parseInt(profileForm.values.age),
          gender: profileForm.values.gender,
          city: profileForm.values.city,
          state: profileForm.values.state,
        })
        addToast('Profile updated successfully', 'success')
      } else {
        addDonor({
          id: generateId('donor'),
          name: profileForm.values.name,
          email: profileForm.values.email,
          phone: profileForm.values.phone,
          bloodGroup: profileForm.values.bloodGroup,
          age: parseInt(profileForm.values.age),
          gender: profileForm.values.gender,
          city: profileForm.values.city,
          state: profileForm.values.state,
          availability: 'Available',
        })
        addToast('Profile created successfully', 'success')
      }

      setShowProfileForm(false)
    } finally {
      profileForm.setIsSubmitting(false)
    }
  }

  // Handle appointment scheduling
  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    appointmentForm.setIsSubmitting(true)

    const rules = {
      appointmentDate: { required: true },
      appointmentTime: { required: true },
      centerName: { required: true },
    }

    const errors = validate(appointmentForm.values, rules)
    if (Object.keys(errors).length > 0) {
      appointmentForm.setErrors(errors)
      appointmentForm.setIsSubmitting(false)
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      setAppointments(prev => [...prev, {
        id: generateId('apt'),
        date: appointmentForm.values.appointmentDate,
        time: appointmentForm.values.appointmentTime,
        center: appointmentForm.values.centerName,
        status: 'Scheduled',
      }])

      addToast('Appointment scheduled successfully', 'success')
      appointmentForm.resetForm()
      setShowAppointmentForm(false)
    } finally {
      appointmentForm.setIsSubmitting(false)
    }
  }

  // Cancel appointment
  const handleCancelAppointment = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => prev.filter(a => a.id !== id))
      addToast('Appointment cancelled', 'success')
    }
  }

  // Stats
  const totalDonations = 5
  const nextEligibleDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <DashboardLayout
      title="Donor Dashboard"
      subtitle="Manage your donations and appointments"
      userRole="Blood Donor"
      navItems={navItems}
    >
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Total Donations"
          value={totalDonations}
          icon={<Heart className="h-6 w-6" />}
          color="blood"
        />
        <StatCard
          label="Blood Group"
          value={currentDonor?.bloodGroup || 'N/A'}
          icon={<Heart className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Scheduled"
          value={appointments.filter(a => a.status === 'Scheduled').length}
          icon={<Calendar className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="Availability"
          value={currentDonor?.availability || 'Unknown'}
          icon={<Check className="h-6 w-6" />}
          color="amber"
        />
      </div>

      {/* Profile Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
          <Button
            onClick={() => {
              profileForm.setValues({
                name: currentDonor?.name || '',
                email: currentDonor?.email || '',
                phone: currentDonor?.phone || '',
                bloodGroup: currentDonor?.bloodGroup || 'O+',
                age: currentDonor?.age?.toString() || '25',
                gender: currentDonor?.gender || 'Male',
                city: currentDonor?.city || 'Delhi',
                state: currentDonor?.state || 'Delhi',
              })
              setShowProfileForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {showProfileForm && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowProfileForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.values.name}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.values.phone}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={profileForm.values.bloodGroup}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="65"
                    value={profileForm.values.age}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={profileForm.values.gender}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={profileForm.values.city}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    name="state"
                    value={profileForm.values.state}
                    onChange={profileForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={profileForm.isSubmitting}
                  className="flex-1"
                >
                  {profileForm.isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowProfileForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">{currentDonor?.name || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <p className="text-lg font-semibold text-blood-600">{currentDonor?.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{currentDonor?.email || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-semibold text-gray-900">{currentDonor?.phone || 'Not Set'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Appointments</h2>
          <Button
            onClick={() => {
              appointmentForm.resetForm()
              setShowAppointmentForm(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>

        {showAppointmentForm && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Schedule Appointment</h3>
              <button
                onClick={() => {
                  setShowAppointmentForm(false)
                  appointmentForm.resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={appointmentForm.values.appointmentDate}
                    onChange={appointmentForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={appointmentForm.values.appointmentTime}
                    onChange={appointmentForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Donation Center</label>
                  <input
                    type="text"
                    name="centerName"
                    value={appointmentForm.values.centerName}
                    onChange={appointmentForm.handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Enter donation center name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={appointmentForm.isSubmitting}
                  className="flex-1"
                >
                  {appointmentForm.isSubmitting ? 'Scheduling...' : 'Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAppointmentForm(false)
                    appointmentForm.resetForm()
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Center</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No scheduled appointments
                    </td>
                  </tr>
                ) : (
                  appointments.map(apt => (
                    <tr key={apt.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{apt.time}</td>
                      <td className="px-4 py-3 text-gray-600">{apt.center}</td>
                      <td className="px-4 py-3">
                        <Badge variant="success">{apt.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
