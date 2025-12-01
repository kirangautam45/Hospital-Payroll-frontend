import { useState, useEffect } from 'react'
import { useUploadStore } from '../stores/uploadStore'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useThemeStore } from '../stores/themeStore'
import { Layout } from '../components/Layout'
import { ExcelUploadZustand } from '../components/ExcelUploadZustand'
import { EmptyState } from '../components/EmptyState'
import { analyticsApi, personApi } from '../utils/api'
import { Upload, ChevronDown } from 'lucide-react'
import type { TopEarnerAPI } from '../types/analytics'
import type {
  SalaryRecordFull,
  SalaryRecordTotals,
  Pagination,
} from '../types/api'

const ITEMS_PER_PAGE = 20

export function Dashboard() {
  const { result, reset } = useUploadStore()
  const {
    dashboard,
    fetchDashboard,
    isLoading: dashboardLoading,
  } = useAnalyticsStore()
  const { isDarkMode } = useThemeStore()
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [topEarners, setTopEarners] = useState<TopEarnerAPI[]>([])
  const [loadingEarners, setLoadingEarners] = useState(false)
  const [uploadedPage, setUploadedPage] = useState(1)

  // All salary records from backend (shown when no upload result)
  const [allSalaryRecords, setAllSalaryRecords] = useState<SalaryRecordFull[]>(
    []
  )
  const [salaryTotals, setSalaryTotals] = useState<SalaryRecordTotals>({
    totalGross: 0,
    totalNet: 0,
    totalTax: 0,
  })
  const [salaryPagination, setSalaryPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
  })
  const [loadingSalaryRecords, setLoadingSalaryRecords] = useState(false)
  const [salaryRecordsPage, setSalaryRecordsPage] = useState(1)

  const records = result?.files.flatMap((f) => f.records || []) || []

  // Pagination for uploaded records
  const uploadedTotalPages = Math.ceil(records.length / ITEMS_PER_PAGE)
  const uploadedStartIndex = (uploadedPage - 1) * ITEMS_PER_PAGE
  const paginatedRecords = records.slice(
    uploadedStartIndex,
    uploadedStartIndex + ITEMS_PER_PAGE
  )

  // Fetch all salary records from backend
  const fetchAllSalaryRecords = async (page: number) => {
    setLoadingSalaryRecords(true)
    try {
      const data = await personApi.getAllSalaryRecords(page, ITEMS_PER_PAGE)
      setAllSalaryRecords(data.records)
      setSalaryTotals(data.totals)
      setSalaryPagination(data.pagination)
    } catch (err) {
      console.error('Failed to load salary records:', err)
    } finally {
      setLoadingSalaryRecords(false)
    }
  }

  // Fetch dashboard and top earners on mount
  useEffect(() => {
    fetchDashboard()

    const loadTopEarners = async () => {
      setLoadingEarners(true)
      try {
        // Fetch more records for pagination
        const data = await analyticsApi.getTopEarners(500)
        setTopEarners(data.topEarners)
      } catch (err) {
        console.error('Failed to load top earners:', err)
      } finally {
        setLoadingEarners(false)
      }
    }

    loadTopEarners()
    fetchAllSalaryRecords(1)
  }, [fetchDashboard])

  // Fetch salary records when page changes
  useEffect(() => {
    if (salaryRecordsPage > 1) {
      fetchAllSalaryRecords(salaryRecordsPage)
    }
  }, [salaryRecordsPage])

  const isLoading = dashboardLoading || loadingEarners

  // Pagination calculations

  const handleUploadedPageChange = (page: number) => {
    setUploadedPage(page)
    document
      .getElementById('uploaded-records')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSalaryRecordsPageChange = (page: number) => {
    setSalaryRecordsPage(page)
    document
      .getElementById('all-salary-records')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>
      <div className='space-y-6'>
        {/* Upload Section - Compact at top */}
        <div
          className={`rounded-2xl shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
              isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center gap-3'>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}
              >
                <Upload
                  className={`w-5 h-5 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />
              </div>
              <div className='text-left'>
                <h3
                  className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Upload Salary Data
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Click to upload Excel files
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showUploadZone ? 'rotate-180' : ''
              } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            />
          </button>

          {showUploadZone && (
            <div
              className={`px-6 pb-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <div className='pt-4'>
                <ExcelUploadZustand />
              </div>
            </div>
          )}
        </div>

        {/* Upload Results - Show if data was just uploaded */}
        {result && (
          <div
            className={`rounded-2xl shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className='p-6 space-y-6'>
              {/* Summary Cards */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[
                  {
                    label: 'Files Processed',
                    value: result.filesProcessed,
                    color: 'blue',
                  },
                  {
                    label: 'Total Rows',
                    value: result.totalRowsRead,
                    color: 'gray',
                  },
                  {
                    label: 'Inserted',
                    value: result.totalInserted,
                    color: 'green',
                  },
                  {
                    label: 'Skipped',
                    value: result.totalSkipped,
                    color: 'amber',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl p-4 transition-transform hover:scale-105`}
                    style={{
                      background: isDarkMode
                        ? stat.color === 'blue'
                          ? 'rgba(59, 130, 246, 0.1)'
                          : stat.color === 'green'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : stat.color === 'amber'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(107, 114, 128, 0.1)'
                        : stat.color === 'blue'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : stat.color === 'green'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : stat.color === 'amber'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(107, 114, 128, 0.1)',
                    }}
                  >
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode
                          ? stat.color === 'blue'
                            ? 'text-blue-400'
                            : stat.color === 'green'
                            ? 'text-green-400'
                            : stat.color === 'amber'
                            ? 'text-amber-400'
                            : 'text-gray-400'
                          : stat.color === 'blue'
                          ? 'text-blue-600'
                          : stat.color === 'green'
                          ? 'text-green-600'
                          : stat.color === 'amber'
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`text-3xl font-bold mt-1 ${
                        isDarkMode
                          ? stat.color === 'blue'
                            ? 'text-blue-300'
                            : stat.color === 'green'
                            ? 'text-green-300'
                            : stat.color === 'amber'
                            ? 'text-amber-300'
                            : 'text-gray-200'
                          : stat.color === 'blue'
                          ? 'text-blue-700'
                          : stat.color === 'green'
                          ? 'text-green-700'
                          : stat.color === 'amber'
                          ? 'text-amber-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Uploaded Records Table with Pagination */}
              {records.length > 0 && (
                <div
                  id='uploaded-records'
                  className={`rounded-xl overflow-hidden border shadow-lg ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className='bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-4'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                      <div>
                        <h3 className='font-bold text-white text-lg'>
                          Uploaded Records Preview
                        </h3>
                        <p className='text-blue-200 text-sm'>
                          {records.length} records loaded
                        </p>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <span className='px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium backdrop-blur-sm'>
                          Gross: Rs.{' '}
                          {records
                            .reduce((sum, r) => sum + (r.grossAmount || 0), 0)
                            .toLocaleString()}
                        </span>
                        <span className='px-3 py-1.5 bg-green-500/30 rounded-lg text-green-100 text-xs font-medium backdrop-blur-sm'>
                          Net: Rs.{' '}
                          {records
                            .reduce((sum, r) => sum + (r.netSalary || 0), 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='overflow-x-auto'>
                    <table className='min-w-full text-sm'>
                      <thead>
                        <tr
                          className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}
                        >
                          <th
                            className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            S.N.
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[120px] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            PAN
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Position
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[180px] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Name
                          </th>
                          <th
                            className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                              isDarkMode
                                ? 'text-blue-400 bg-blue-900/30'
                                : 'text-blue-600 bg-blue-50'
                            }`}
                          >
                            Days
                          </th>
                          <th
                            className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Rate
                          </th>
                          <th
                            className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Gross
                          </th>
                          <th
                            className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isDarkMode
                                ? 'text-red-400 bg-red-900/20'
                                : 'text-red-600 bg-red-50'
                            }`}
                          >
                            Tax
                          </th>
                          <th
                            className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isDarkMode
                                ? 'text-green-400 bg-green-900/30'
                                : 'text-green-700 bg-green-100'
                            }`}
                          >
                            Net Salary
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px] ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Account No.
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
                        }`}
                      >
                        {paginatedRecords.map((record, idx) => (
                          <tr
                            key={idx}
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
                              {uploadedStartIndex + idx + 1}
                            </td>
                            <td
                              className={`px-4 py-3 font-mono text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {record.pan || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 nepali-text ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              {record.positionNepali || record.position || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 font-semibold nepali-text ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {record.nameNepali || record.name || '-'}
                            </td>
                            <td
                              className={`px-3 py-3 text-center font-bold ${
                                isDarkMode
                                  ? 'text-blue-200 bg-blue-900/20'
                                  : 'text-blue-700 bg-blue-100/50'
                              }`}
                            >
                              {record.dutyDays?.total || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              {record.rate?.toLocaleString() || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-700'
                              }`}
                            >
                              {record.grossAmount?.toLocaleString() || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold ${
                                isDarkMode
                                  ? 'text-red-400 bg-red-900/10'
                                  : 'text-red-600 bg-red-50/50'
                              }`}
                            >
                              {record.taxDeduction?.toLocaleString() || '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${
                                isDarkMode
                                  ? 'text-green-400 bg-green-900/20'
                                  : 'text-green-700 bg-green-50'
                              }`}
                            >
                              {(record.netSalary ?? 0).toLocaleString()}
                            </td>
                            <td
                              className={`px-4 py-3 font-mono text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {record.accountNumber || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls for Uploaded Records */}
                  {uploadedTotalPages > 1 && (
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
                        Showing {uploadedStartIndex + 1} to{' '}
                        {Math.min(
                          uploadedStartIndex + ITEMS_PER_PAGE,
                          records.length
                        )}{' '}
                        of {records.length} records
                      </p>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleUploadedPageChange(1)}
                          disabled={uploadedPage === 1}
                          className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          First
                        </button>
                        <button
                          onClick={() =>
                            handleUploadedPageChange(uploadedPage - 1)
                          }
                          disabled={uploadedPage === 1}
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
                            { length: Math.min(5, uploadedTotalPages) },
                            (_, i) => {
                              let pageNum
                              if (uploadedTotalPages <= 5) {
                                pageNum = i + 1
                              } else if (uploadedPage <= 3) {
                                pageNum = i + 1
                              } else if (
                                uploadedPage >=
                                uploadedTotalPages - 2
                              ) {
                                pageNum = uploadedTotalPages - 4 + i
                              } else {
                                pageNum = uploadedPage - 2 + i
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    handleUploadedPageChange(pageNum)
                                  }
                                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                                    uploadedPage === pageNum
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
                          onClick={() =>
                            handleUploadedPageChange(uploadedPage + 1)
                          }
                          disabled={uploadedPage === uploadedTotalPages}
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
                            handleUploadedPageChange(uploadedTotalPages)
                          }
                          disabled={uploadedPage === uploadedTotalPages}
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
                </div>
              )}

              <button
                onClick={reset}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Clear Upload Results
              </button>
            </div>
          </div>
        )}

        {/* All Salary Records from Backend - Show when no recent upload */}
        {!result && allSalaryRecords.length > 0 && (
          <div
            id='all-salary-records'
            className={`rounded-2xl shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className='bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-4'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                <div>
                  <h3 className='font-bold text-white text-lg'>
                    All Salary Records
                  </h3>
                  <p className='text-blue-200 text-sm'>
                    {salaryPagination.total.toLocaleString()} records in
                    database
                  </p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium backdrop-blur-sm'>
                    Gross: Rs. {salaryTotals.totalGross.toLocaleString()}
                  </span>
                  <span className='px-3 py-1.5 bg-red-500/30 rounded-lg text-red-100 text-xs font-medium backdrop-blur-sm'>
                    Tax: Rs. {salaryTotals.totalTax.toLocaleString()}
                  </span>
                  <span className='px-3 py-1.5 bg-green-500/30 rounded-lg text-green-100 text-xs font-medium backdrop-blur-sm'>
                    Net: Rs. {salaryTotals.totalNet.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {loadingSalaryRecords ? (
              <div className='p-8 text-center'>
                <div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2' />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Loading records...
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
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[120px] ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          PAN
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Position
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[180px] ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Name
                        </th>
                        <th
                          className={`px-3 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                            isDarkMode
                              ? 'text-blue-400 bg-blue-900/30'
                              : 'text-blue-600 bg-blue-50'
                          }`}
                        >
                          Days
                        </th>
                        <th
                          className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Rate
                        </th>
                        <th
                          className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Gross
                        </th>
                        <th
                          className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                            isDarkMode
                              ? 'text-red-400 bg-red-900/20'
                              : 'text-red-600 bg-red-50'
                          }`}
                        >
                          Tax
                        </th>
                        <th
                          className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                            isDarkMode
                              ? 'text-green-400 bg-green-900/30'
                              : 'text-green-700 bg-green-100'
                          }`}
                        >
                          Net Salary
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px] ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Account No.
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
                      }`}
                    >
                      {allSalaryRecords.map((record, idx) => (
                        <tr
                          key={record._id}
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
                            {(salaryRecordsPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td
                            className={`px-4 py-3 font-mono text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {record.pan || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 nepali-text ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {record.positionNepali || record.position || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold nepali-text ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {record.nameNepali || record.name || '-'}
                          </td>
                          <td
                            className={`px-3 py-3 text-center font-bold ${
                              isDarkMode
                                ? 'text-blue-200 bg-blue-900/20'
                                : 'text-blue-700 bg-blue-100/50'
                            }`}
                          >
                            {record.dutyDays?.total || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {record.rate?.toLocaleString() || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}
                          >
                            {record.grossAmount?.toLocaleString() || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-semibold ${
                              isDarkMode
                                ? 'text-red-400 bg-red-900/10'
                                : 'text-red-600 bg-red-50/50'
                            }`}
                          >
                            {record.taxDeduction?.toLocaleString() || '-'}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-bold ${
                              isDarkMode
                                ? 'text-green-400 bg-green-900/20'
                                : 'text-green-700 bg-green-50'
                            }`}
                          >
                            {(record.netSalary ?? 0).toLocaleString()}
                          </td>
                          <td
                            className={`px-4 py-3 font-mono text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {record.accountNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls for All Salary Records */}
                {salaryPagination.pages > 1 && (
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
                      Showing {(salaryRecordsPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                      {Math.min(
                        salaryRecordsPage * ITEMS_PER_PAGE,
                        salaryPagination.total
                      )}{' '}
                      of {salaryPagination.total.toLocaleString()} records
                    </p>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handleSalaryRecordsPageChange(1)}
                        disabled={salaryRecordsPage === 1}
                        className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          handleSalaryRecordsPageChange(salaryRecordsPage - 1)
                        }
                        disabled={salaryRecordsPage === 1}
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
                          { length: Math.min(5, salaryPagination.pages) },
                          (_, i) => {
                            let pageNum
                            if (salaryPagination.pages <= 5) {
                              pageNum = i + 1
                            } else if (salaryRecordsPage <= 3) {
                              pageNum = i + 1
                            } else if (
                              salaryRecordsPage >=
                              salaryPagination.pages - 2
                            ) {
                              pageNum = salaryPagination.pages - 4 + i
                            } else {
                              pageNum = salaryRecordsPage - 2 + i
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() =>
                                  handleSalaryRecordsPageChange(pageNum)
                                }
                                className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                                  salaryRecordsPage === pageNum
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
                        onClick={() =>
                          handleSalaryRecordsPageChange(salaryRecordsPage + 1)
                        }
                        disabled={salaryRecordsPage === salaryPagination.pages}
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
                          handleSalaryRecordsPageChange(salaryPagination.pages)
                        }
                        disabled={salaryRecordsPage === salaryPagination.pages}
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
        )}

        {/* Loading State */}
        {isLoading && !dashboard && topEarners.length === 0 && (
          <div
            className={`rounded-2xl p-12 text-center ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white shadow-lg'
            }`}
          >
            <div className='animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4' />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Loading dashboard data...
            </p>
          </div>
        )}

        {/* Empty State - No data at all */}
        {!isLoading && !result && !dashboard && topEarners.length === 0 && (
          <EmptyState
            message='No data available. Upload an Excel file to get started.'
            icon='document'
          />
        )}
      </div>
    </Layout>
  )
}
