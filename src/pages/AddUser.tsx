import { useState, useEffect, useCallback } from 'react'
import { useThemeStore } from '../stores/themeStore'
import { Layout } from '../components/Layout'
import { authApi } from '../utils/api'
import { toast } from 'sonner'
import {
  UserPlus,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Users,
  Loader2,
} from 'lucide-react'
import type { User as UserType } from '../types/auth'

const ITEMS_PER_PAGE = 10

export function AddUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState('')

  // User list state
  const [users, setUsers] = useState<UserType[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
  })
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersPage, setUsersPage] = useState(1)

  const { isDarkMode } = useThemeStore()

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const data = await authApi.getAllUsers()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handlePageChange = (page: number) => {
    setUsersPage(page)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await authApi.register({ email, password, name: name || undefined })
      toast.success('User added successfully')
      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      // Refresh user list
      fetchUsers()
      setUsersPage(1)
    } catch (err) {
      const axiosError = err as Error & {
        response?: { data?: { error?: string } }
      }
      toast.error(axiosError.response?.data?.error || 'Failed to add user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className='mb-6'>
        <h2
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          User Management
        </h2>
        <p
          className={`mt-1 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          View all users and create new accounts
        </p>
      </div>

      {/* Split Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        {/* User List - Left Side (3/5) */}
        <div className='lg:col-span-3'>
          <div
            className={`rounded-xl shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='bg-white/20 backdrop-blur-sm p-2 rounded-lg'>
                    <Users className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-white'>
                      All Users
                    </h3>
                    <p className='text-blue-200 text-sm'>
                      {pagination.total} users in system
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className='p-8 text-center'>
                <Loader2 className='w-8 h-8 animate-spin mx-auto mb-2 text-blue-500' />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Loading users...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className='p-8 text-center'>
                <Users
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}
                />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  No users found. Create one using the form.
                </p>
              </div>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className='min-w-full text-sm'>
                    <thead
                      className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                    >
                      <tr>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          S.N.
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Name
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Email
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
                      }`}
                    >
                      {users.map((user, idx) => (
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            isDarkMode
                              ? `${
                                  idx % 2 === 0
                                    ? 'bg-gray-800/50'
                                    : 'bg-gray-800'
                                } hover:bg-gray-700`
                              : `${
                                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                } hover:bg-blue-50`
                          }`}
                        >
                          <td
                            className={`px-4 py-3 font-medium ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            {(usersPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {user.name || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            {user.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div
                    className={`px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Page {usersPage} of {pagination.pages}
                    </p>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={usersPage === 1}
                        className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        First
                      </button>
                      <button
                        onClick={() => handlePageChange(usersPage - 1)}
                        disabled={usersPage === 1}
                        className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(usersPage + 1)}
                        disabled={usersPage === pagination.pages}
                        className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Next
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.pages)}
                        disabled={usersPage === pagination.pages}
                        className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add User Form - Right Side (2/5) */}
        <div className='lg:col-span-2'>
          <div
            className={`rounded-xl shadow-lg overflow-hidden sticky top-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='bg-white/20 backdrop-blur-sm p-2 rounded-lg'>
                  <UserPlus className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-lg font-semibold text-white'>
                  Add New User
                </h3>
              </div>
            </div>

            <div className='p-6'>
              <form onSubmit={handleSubmit} className='space-y-5'>
                {/* Name field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='name'
                    className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Full Name{' '}
                    <span
                      className={`font-normal ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      (Optional)
                    </span>
                  </label>
                  <div className='relative'>
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'name'
                          ? 'text-indigo-500'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      <User className='w-5 h-5' />
                    </div>
                    <input
                      id='name'
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                      } focus:outline-none`}
                      placeholder='John Doe'
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email Address
                  </label>
                  <div className='relative'>
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'email'
                          ? 'text-indigo-500'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      <Mail className='w-5 h-5' />
                    </div>
                    <input
                      id='email'
                      type='email'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                      } focus:outline-none`}
                      placeholder='user@example.com'
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='password'
                    className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'password'
                          ? 'text-indigo-500'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      <Lock className='w-5 h-5' />
                    </div>
                    <input
                      id='password'
                      type='password'
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                      } focus:outline-none`}
                      placeholder='Min 6 characters'
                    />
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className='space-y-2'>
                  <label
                    htmlFor='confirmPassword'
                    className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Confirm Password
                  </label>
                  <div className='relative'>
                    <div
                      className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'confirmPassword'
                          ? 'text-indigo-500'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      <ShieldCheck className='w-5 h-5' />
                    </div>
                    <input
                      id='confirmPassword'
                      type='password'
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                      } focus:outline-none`}
                      placeholder='Confirm password'
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full mt-6 py-3.5 px-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Adding user...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className='w-5 h-5' />
                      <span>Add User</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
