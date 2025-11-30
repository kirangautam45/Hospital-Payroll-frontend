import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

// Icons
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const { login, isLoading } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      const axiosError = err as Error & { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-3 rounded-xl transition-all duration-300 z-50 ${
          isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 shadow-lg shadow-gray-900/50'
            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 shadow-lg shadow-gray-200/50'
        }`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse ${
          isDarkMode ? 'bg-blue-900 opacity-30' : 'bg-blue-200 opacity-20'
        }`}></div>
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse ${
            isDarkMode ? 'bg-cyan-900 opacity-30' : 'bg-cyan-200 opacity-20'
          }`}
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Main card */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center">Hospital Payroll</h1>
              <p className="text-blue-100 text-center mt-2 text-sm">Secure access to your account</p>
            </div>
          </div>

          {/* Form section */}
          <div className="px-8 py-8">
            {error && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                isDarkMode
                  ? 'bg-red-900/30 border border-red-800'
                  : 'bg-red-50 border-l-4 border-red-500'
              }`}>
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'email'
                      ? 'text-blue-500'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <button
                    type="button"
                    className={`text-xs font-medium transition-colors ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'password'
                      ? 'text-blue-500'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    } focus:outline-none`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 font-medium ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  New to Hospital Payroll?
                </span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <Link
                to="/register"
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors group ${
                  isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Create your account
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Secured with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
