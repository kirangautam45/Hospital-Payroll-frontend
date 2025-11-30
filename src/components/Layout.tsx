import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'

// Icons
const SunIcon = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
    />
  </svg>
)

const MoonIcon = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
    />
  </svg>
)

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  {
    to: '/',
    label: 'Upload',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  },
  {
    to: '/lookup',
    label: 'PAN Lookup',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-900'
          : 'bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/80 backdrop-blur-md border-gray-200'
        } shadow-sm sticky top-0 z-50 border-b`}
      >
        <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-xl ${
                isDarkMode
                  ? 'bg-linear-to-br from-blue-500 to-indigo-600'
                  : 'bg-linear-to-br from-blue-500 to-indigo-600'
              } flex items-center justify-center shadow-lg shadow-blue-500/30`}
            >
              <span className='text-white font-bold text-lg'>H</span>
            </div>
            <div>
              <h1
                className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Hospital Payroll
              </h1>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Management System
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:text-yellow-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
              title={
                isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav
        className={`${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
        } backdrop-blur-sm border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex gap-1'>
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 py-3 px-4 text-sm font-medium rounded-t-xl transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
                        : 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 py-6 flex-1'>{children}</main>

      {/* Footer */}
      <footer
        className={`mt-auto py-4 text-center text-sm ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        <p>
          &copy; {new Date().getFullYear()} Hospital Payroll System. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}
