import { useState, useEffect, useCallback, useRef } from 'react';
import { usePharmacyUploadStore } from '../stores/pharmacyStore';
import { useThemeStore } from '../stores/themeStore';
import { pharmacyApi } from '../utils/api';
import type { PharmacyRecord, Pagination } from '../types/api';

export default function Pharmacy() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useThemeStore();

  const { status, selectedFiles, result, error, addFiles, removeFile, uploadFiles, reset } =
    usePharmacyUploadStore();

  const [records, setRecords] = useState<PharmacyRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totals, setTotals] = useState({ totalGross: 0, totalNet: 0, totalTax: 0 });
  const [loading, setLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(true);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await pharmacyApi.getAll(page, 20);
      setRecords(data.records);
      setPagination(data.pagination);
      setTotals(data.totals);
    } catch (err) {
      console.error('Failed to fetch pharmacy records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (status === 'complete') {
      fetchRecords();
    }
  }, [status, fetchRecords]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
      }
    },
    [addFiles]
  );

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Pharmacy Records
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload and manage pharmacy staff salary records
          </p>
        </div>

        {/* Upload Section */}
        <div
          className={`mb-6 rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'
          }`}
        >
          <button
            onClick={() => setIsUploadOpen(!isUploadOpen)}
            className={`w-full px-6 py-4 flex items-center justify-between ${
              isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Pharmacy Excel Files
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${isUploadOpen ? 'rotate-180' : ''} ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUploadOpen && (
            <div className="px-6 pb-6">
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                  ${
                    isDragging
                      ? isDarkMode
                        ? 'border-green-400 bg-green-900/20'
                        : 'border-green-500 bg-green-50'
                      : isDarkMode
                      ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
                  }
                  ${
                    status === 'error'
                      ? isDarkMode
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-red-300 bg-red-50'
                      : ''
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {status === 'idle' && (
                  <>
                    <div
                      className={`mb-4 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                        isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                      }`}
                    >
                      <svg
                        className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <p
                      className={`text-lg font-medium mb-1 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      Drag and drop Pharmacy Excel files here
                    </p>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25'
                      }`}
                    >
                      Browse Files
                    </button>
                    <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Supports .xlsx and .xls files (max 25MB each, up to 10 files)
                    </p>
                  </>
                )}

                {status === 'uploading' && (
                  <div className="py-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div
                        className={`absolute inset-0 rounded-full border-4 ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
                    </div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Uploading {selectedFiles.length} file(s)...
                    </p>
                  </div>
                )}

                {status === 'complete' && (
                  <div className="py-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                      }`}
                    >
                      <svg
                        className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Upload complete!
                    </p>
                    {result && (
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {result.totalInserted} inserted, {result.totalUpdated} updated
                      </p>
                    )}
                    <button
                      onClick={reset}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Upload More
                    </button>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className={`mt-4 p-4 rounded-xl text-sm ${
                    isDarkMode
                      ? 'bg-red-900/20 border border-red-800 text-red-400'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  <p className="whitespace-pre-line">{error}</p>
                  {status === 'error' && (
                    <button
                      onClick={reset}
                      className={`mt-2 font-medium ${
                        isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {/* Selected Files */}
              {selectedFiles.length > 0 && status === 'idle' && (
                <div className="mt-4">
                  <h3
                    className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                            }`}
                          >
                            <svg
                              className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                          </div>
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}
                            >
                              {file.name}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className={`p-1.5 rounded-lg ${
                            isDarkMode
                              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={uploadFiles}
                    className={`mt-4 w-full py-3 font-semibold rounded-lg ${
                      isDarkMode
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }`}
                  >
                    Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Gross</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totals.totalGross)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Tax</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totals.totalTax)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Net</p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {formatCurrency(totals.totalNet)}
            </p>
          </div>
        </div>

        {/* Records Table */}
        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Pharmacy Staff Records
              {pagination && (
                <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({pagination.total} total)
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                No pharmacy records found. Upload an Excel file to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PAN
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Name
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Position
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Night Duty
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Rate
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Gross
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tax
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Net Payable
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {records.map((record) => (
                    <tr
                      key={record._id}
                      className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                    >
                      <td className={`px-4 py-3 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {record.pan}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {record.name || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {record.position || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {record.nightDutyCount || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {record.rate?.toFixed(2) || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatCurrency(record.grossAmount)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {formatCurrency(record.taxDeduction)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(record.netPayable)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchRecords(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? isDarkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchRecords(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`px-3 py-1 rounded ${
                      pagination.page === pagination.pages
                        ? isDarkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
