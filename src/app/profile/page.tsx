'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useI18n } from '@/lib/i18n/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, updateProfile } = useAuth()
  const { t } = useI18n()
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [district, setDistrict] = useState('')
  const [occupation, setOccupation] = useState('')
  const [education, setEducation] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
    if (user) {
      setName(user.name)
      setPhone(user.phone || '')
      setAge(user.profile?.age || '')
      setDistrict(user.profile?.district || '')
      setOccupation(user.profile?.occupation || '')
      setEducation(user.profile?.education || '')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await updateProfile({
        name,
        phone: phone || undefined,
        profile: {
          age: age ? Number(age) : undefined,
          district: district || undefined,
          occupation: occupation || undefined,
          education: education || undefined,
        },
      })
      setMessage('Profile updated successfully!')
    } catch (err) {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#000d08] flex items-center justify-center pt-20">
        <p className="text-[#414845] dark:text-[#c4c2bd]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#000d08] px-4 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#885207] hover:underline">
            ← {t('profile.backHome', 'Back to home')}
          </Link>
          <h1 className="font-headline text-4xl font-bold text-[#00271d] dark:text-[#fbf9f4] mt-4 mb-2">
            {t('profile.title', 'Your Profile')}
          </h1>
          <p className="text-[#414845] dark:text-[#c4c2bd]">
            {t('profile.subtitle', 'Update your information to get better recommendations')}
          </p>
        </div>

        <div className="bg-white dark:bg-[#001410] rounded-lg shadow-lg p-8 border border-[#e0ddd7] dark:border-[#00271d]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`rounded-lg p-4 text-sm ${
                message.includes('success')
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.name', 'Full Name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.phone', 'Phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.age', 'Age')}
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.district', 'District')}
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                  placeholder="e.g., Srinagar"
                />
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.occupation', 'Occupation')}
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                  placeholder="e.g., Student, Farmer"
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-[#00271d] dark:text-[#fbf9f4] mb-2">
                  {t('profile.education', 'Education')}
                </label>
                <input
                  id="education"
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#e0ddd7] dark:border-[#00271d] bg-[#fbf9f4] dark:bg-[#000d08] text-[#00271d] dark:text-[#fbf9f4] focus:outline-none focus:ring-2 focus:ring-[#885207]"
                  placeholder="e.g., 12th Pass, Graduate"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full raasta-btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t('profile.saving', 'Saving...') : t('profile.save', 'Save Changes')}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white dark:bg-[#001410] rounded-lg shadow-lg p-6 border border-[#e0ddd7] dark:border-[#00271d]">
          <h2 className="font-headline text-xl font-bold text-[#00271d] dark:text-[#fbf9f4] mb-2">
            Account Information
          </h2>
          <div className="space-y-2 text-sm text-[#414845] dark:text-[#c4c2bd]">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Language:</span> {user.locale}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
