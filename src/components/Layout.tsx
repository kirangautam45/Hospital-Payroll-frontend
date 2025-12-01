import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { Sun, Moon, Upload, Search, type LucideIcon } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Upload',
    icon: Upload,
  },
  // {
  //   to: '/pharmacy',
  //   label: 'Pharmacy',
  //   icon: Pill,
  // },
  {
    to: '/lookup',
    label: 'PAN Lookup',
    icon: Search,
  },
  // {
  //   to: '/analytics',
  //   label: 'Analytics',
  //   icon: BarChart3,
  // },
  // {
  //   to: '/reports',
  //   label: 'Reports',
  //   icon: FileText,
  // },
  // {
  //   to: '/add-user',
  //   label: 'Add User',
  //   icon: UserPlus,
  // },
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
          : 'bg-linear-to-brc from-slate-50 via-blue-50 to-indigo-50'
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
              {isDarkMode ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
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
              const Icon = item.icon
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
                  <Icon className='w-4 h-4' />
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
