import { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import { Layout } from '../components/Layout'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useThemeStore } from '../stores/themeStore'
import { personApi } from '../utils/api'
import { generateSalaryHistoryPDF } from '../utils/pdfGenerator'
import { EmptyState } from '../components/EmptyState'
import type {
  PersonResponse,
  PersonSummary,
  Person,
  Pagination,
} from '../types/api'

const ITEMS_PER_PAGE = 20

export function Lookup() {
  const { autocompleteResults, isSearching, searchPan, clearAutocomplete } =
    useAnalyticsStore()
  const { isDarkMode } = useThemeStore()

  const [pan, setPan] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [personData, setPersonData] = useState<PersonResponse | null>(null)
  const [summary, setSummary] = useState<PersonSummary | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAutocomplete, setShowAutocomplete] = useState(false)

  // Date range filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // All persons from backend
  const [allPersons, setAllPersons] = useState<Person[]>([])
  const [personsPagination, setPersonsPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
  })
  const [personsPage, setPersonsPage] = useState(1)
  const [loadingPersons, setLoadingPersons] = useState(false)

  const autocompleteRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search for autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pan.length >= 2) {
        searchPan(pan)
        setShowAutocomplete(true)
      } else {
        clearAutocomplete()
        setShowAutocomplete(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [pan, searchPan, clearAutocomplete])

  // Fetch all persons from backend
  const fetchAllPersons = async (page: number, showToast = false) => {
    setLoadingPersons(true)
    try {
      const data = await personApi.getAllPersons(page, ITEMS_PER_PAGE)
      setAllPersons(data.persons)
      setPersonsPagination(data.pagination)
      if (showToast && data.pagination.total > 0) {
        toast.success(`Loaded ${data.pagination.total.toLocaleString()} employees`, {
          description: 'Employee Directory is ready',
        })
      }
    } catch (err) {
      console.error('Failed to load persons:', err)
      toast.error('Failed to load employee directory')
    } finally {
      setLoadingPersons(false)
    }
  }

  // Fetch persons on mount
  useEffect(() => {
    fetchAllPersons(1, true)
  }, [])

  // Fetch persons when page changes
  useEffect(() => {
    if (personsPage > 1) {
      fetchAllPersons(personsPage)
    }
  }, [personsPage])

  const handlePersonsPageChange = (page: number) => {
    setPersonsPage(page)
    document
      .getElementById('all-persons')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const validatePan = (value: string): boolean => {
    const trimmed = value.trim()
    // Accept Nepali PAN (9 digits) or account numbers (13-17 digits)
    const nepaliPanRegex = /^[0-9]{9}$/
    const accountRegex = /^[0-9]{13,17}$/
    return nepaliPanRegex.test(trimmed) || accountRegex.test(trimmed)
  }

  const handleSearch = async (searchPanValue?: string) => {
    const panToSearch = searchPanValue || pan
    setError('')
    setShowAutocomplete(false)

    const formattedPan = panToSearch.trim()
    if (!validatePan(formattedPan)) {
      setError(
        'Invalid format. Enter 9-digit PAN or 13-17 digit account number.'
      )
      return
    }

    setIsLoading(true)
    try {
      const [personResult, summaryResult] = await Promise.all([
        personApi.getByPan(
          formattedPan,
          1,
          20,
          startDate || undefined,
          endDate || undefined
        ),
        personApi.getSummary(formattedPan),
      ])
      setPersonData(personResult)
      setSummary(summaryResult)
      setCurrentPage(1)
      setPan(formattedPan)
    } catch (err) {
      const axiosError = err as Error & {
        response?: { status?: number; data?: { error?: string } }
      }
      if (axiosError.response?.status === 404) {
        setError('No records found for this PAN.')
      } else {
        setError(axiosError.response?.data?.error || 'Failed to fetch data.')
      }
      setPersonData(null)
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutocompleteSelect = (selectedPan: string) => {
    setPan(selectedPan)
    setShowAutocomplete(false)
    handleSearch(selectedPan)
  }

  const handlePageChange = async (page: number) => {
    if (!personData) return
    setIsLoading(true)
    try {
      const result = await personApi.getByPan(
        pan,
        page,
        20,
        startDate || undefined,
        endDate || undefined
      )
      setPersonData(result)
      setCurrentPage(page)
    } catch (err) {
      console.error('Failed to fetch page:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const result = await personApi.export(pan.toUpperCase(), 'csv')
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result)
        const a = document.createElement('a')
        a.href = url
        a.download = `${pan.toUpperCase()}_salary_history.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleExportPDF = () => {
    if (personData) {
      generateSalaryHistoryPDF(personData)
    }
  }

  // Re-fetch when dates change
  useEffect(() => {
    if (personData && pan) {
      handleSearch(pan)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  // Use server-filtered records directly
  const filteredRecords = personData?.salaryRecords || []

  // Prepare chart data
  const chartData = filteredRecords
    .slice()
    .reverse()
    .map((record) => ({
      date: new Date(record.effectiveFrom).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      salary: record.salaryAmount,
    }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
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
          PAN Lookup
        </h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Search employee salary records by PAN or account number
        </p>
      </div>

      {/* Search Box */}
      <div
        className={`rounded-xl shadow-sm p-6 mb-6 ${
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Search by PAN
        </h3>
        <div className='flex gap-4'>
          <div className='relative flex-1' ref={autocompleteRef}>
            <div
              className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
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
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              value={pan}
              onChange={(e) => setPan(e.target.value.replace(/[^0-9]/g, ''))}
              onFocus={() => pan.length >= 2 && setShowAutocomplete(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='Enter PAN (9 digits) or Account No. (16 digits)'
              maxLength={17}
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              } focus:outline-none`}
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div
                className={`absolute z-10 w-full mt-2 rounded-xl shadow-lg max-h-60 overflow-auto ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {autocompleteResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutocompleteSelect(result.pan)}
                    className={`w-full px-4 py-3 text-left border-b last:border-b-0 flex justify-between items-center transition-colors ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {result.pan}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {result.name}
                      </p>
                    </div>
                    {result.department && (
                      <span
                        className={`text-xs px-2 py-1 rounded-lg ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {result.department}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full' />
              </div>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !validatePan(pan)}
            className={`px-6 py-3 font-medium rounded-xl transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              isDarkMode
                ? 'bg-red-900/30 text-red-400'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-sm'>{error}</span>
          </div>
        )}
      </div>

      {/* Empty State when no persons loaded */}
      {!personData && !error && allPersons.length === 0 && !loadingPersons && (
        <EmptyState
          message='No information available. Search by PAN to view salary records.'
          icon='search'
        />
      )}

      {/* Results */}
      {personData && summary && (
        <>
          {/* Person Info & Summary */}
          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            <div
              className={`rounded-xl shadow-sm p-6 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Person Details
                </h3>
              </div>
              <dl className='space-y-3'>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    PAN
                  </dt>
                  <dd
                    className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {personData.person.pan}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Name
                  </dt>
                  <dd
                    className={`font-medium nepali-text ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {personData.person.nameNepali ||
                      personData.person.name ||
                      '-'}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Position
                  </dt>
                  <dd
                    className={`font-medium nepali-text ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {personData.person.positionNepali ||
                      personData.person.position ||
                      '-'}
                  </dd>
                </div>

                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Total Records
                  </dt>
                  <dd
                    className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {summary.summary.totalRecords}
                  </dd>
                </div>
              </dl>
            </div>

            <div
              className={`rounded-xl shadow-sm p-6 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Salary Summary
                </h3>
              </div>
              <dl className='space-y-3'>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Latest Salary
                  </dt>
                  <dd
                    className={`font-medium ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}
                  >
                    {summary.summary.latestSalary.currency}{' '}
                    {summary.summary.latestSalary.amount.toLocaleString()}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    First Salary
                  </dt>
                  <dd
                    className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {summary.summary.firstSalary.currency}{' '}
                    {summary.summary.firstSalary.amount.toLocaleString()}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Growth
                  </dt>
                  <dd
                    className={`font-medium ${
                      summary.summary.percentChange >= 0
                        ? isDarkMode
                          ? 'text-green-400'
                          : 'text-green-600'
                        : isDarkMode
                        ? 'text-red-400'
                        : 'text-red-600'
                    }`}
                  >
                    {summary.summary.percentChange >= 0 ? '+' : ''}
                    {summary.summary.percentChange.toFixed(2)}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Salary Trend Chart */}
          {chartData.length > 1 && (
            <div
              className={`rounded-xl shadow-sm p-6 mb-6 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Salary Trend
              </h3>
              <ResponsiveContainer width='100%' height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                  />
                  <XAxis
                    dataKey='date'
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: isDarkMode
                        ? '1px solid #374151'
                        : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: isDarkMode ? '#ffffff' : '#000000',
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='salary'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Salary History */}
          <div
            className={`rounded-xl shadow-sm overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Salary History
                </h3>

                {/* Date Range Filter */}
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <label
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      From:
                    </label>
                    <input
                      type='date'
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border border-gray-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <label
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      To:
                    </label>
                    <input
                      type='date'
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border border-gray-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('')
                        setEndDate('')
                      }}
                      className={`text-sm font-medium ${
                        isDarkMode
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Export Buttons */}
                <div className='flex gap-2'>
                  <button
                    onClick={handleExportCSV}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isDarkMode
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      isDarkMode
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z'
                        clipRule='evenodd'
                      />
                    </svg>
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Employer
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Salary
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Effective From
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Source
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Uploaded
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}
                >
                  {filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className={
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }
                    >
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {record.employer || '-'}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}
                      >
                        {record.currency || 'NPR'}{' '}
                        {(record.salaryAmount ?? 0).toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {record.effectiveFrom
                          ? new Date(record.effectiveFrom).toLocaleDateString()
                          : '-'}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {record.source || '-'}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {record.uploadedAt
                          ? new Date(record.uploadedAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div
                className={`px-6 py-12 text-center ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                <svg
                  className='w-12 h-12 mx-auto mb-4 opacity-50'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <p>No records found for the selected date range.</p>
              </div>
            )}

            {/* Pagination */}
            {personData.pagination.pages > 1 && (
              <div
                className={`px-6 py-4 border-t flex justify-between items-center ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Page {currentPage} of {personData.pagination.pages} (
                  {personData.pagination.total} records)
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === personData.pagination.pages}
                    className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* All Persons Table from Backend - Always visible */}
      {allPersons.length > 0 && (
        <div
          id='all-persons'
          className={`rounded-2xl shadow-lg overflow-hidden my-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
              <div>
                <h3 className='font-bold text-white text-lg'>
                  Employee Directory
                </h3>
                <p className='text-blue-200 text-sm'>
                  {personsPagination.total.toLocaleString()} employees in
                  database
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingPersons ? (
        <div className='p-8 text-center'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2' />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Loading employees...
          </p>
        </div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <th
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    S.N.
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[140px] ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    PAN
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[200px] ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Name
                  </th>
                  <th
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px] ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Position
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
                }`}
              >
                {allPersons.map((person, idx) => (
                  <tr
                    key={person._id}
                    className={`transition-colors cursor-pointer ${
                      isDarkMode
                        ? `${
                            idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                          } hover:bg-gray-700`
                        : `${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          } hover:bg-blue-50`
                    }`}
                    onClick={() => handleAutocompleteSelect(person.pan)}
                  >
                    <td
                      className={`px-4 py-3 font-medium ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {(personsPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono text-xs ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      {person.pan}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold nepali-text ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {person.nameNepali || person.name || '-'}
                    </td>
                    <td
                      className={`px-4 py-3 nepali-text ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {person.positionNepali || person.position || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {personsPagination.pages > 1 && (
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
                Showing {(personsPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(
                  personsPage * ITEMS_PER_PAGE,
                  personsPagination.total
                )}{' '}
                of {personsPagination.total.toLocaleString()} employees
              </p>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handlePersonsPageChange(1)}
                  disabled={personsPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => handlePersonsPageChange(personsPage - 1)}
                  disabled={personsPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className='flex items-center gap-1'>
                  {Array.from(
                    { length: Math.min(5, personsPagination.pages) },
                    (_, i) => {
                      let pageNum
                      if (personsPagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (personsPage <= 3) {
                        pageNum = i + 1
                      } else if (personsPage >= personsPagination.pages - 2) {
                        pageNum = personsPagination.pages - 4 + i
                      } else {
                        pageNum = personsPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePersonsPageChange(pageNum)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            personsPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePersonsPageChange(personsPage + 1)}
                  disabled={personsPage === personsPagination.pages}
                  className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() =>
                    handlePersonsPageChange(personsPagination.pages)
                  }
                  disabled={personsPage === personsPagination.pages}
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
    </Layout>
  )
}
