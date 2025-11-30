import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useThemeStore } from '../stores/themeStore';
import { analyticsApi } from '../utils/api';
import { generateDepartmentReportPDF, generateMonthlyReportPDF } from '../utils/pdfGenerator';

type ReportType = 'department' | 'monthly' | 'yearly' | 'tax';

export function Reports() {
  const { dashboard, fetchDashboard } = useAnalyticsStore();
  const { isDarkMode } = useThemeStore();
  const [selectedReport, setSelectedReport] = useState<ReportType>('department');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Try server-side PDF export for supported types
      if (selectedReport === 'department' || selectedReport === 'monthly') {
        try {
          const blob = await analyticsApi.exportReport(selectedReport, 'pdf', selectedYear);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedReport}_report_${selectedYear}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          return;
        } catch {
          // Fall back to client-side PDF if server export fails
        }
      }

      // Fallback to client-side PDF generation
      if (!dashboard) return;
      switch (selectedReport) {
        case 'department':
          generateDepartmentReportPDF(dashboard.departmentSummaries);
          break;
        case 'monthly':
          generateMonthlyReportPDF(dashboard.monthlySummaries, selectedYear);
          break;
        case 'yearly':
          generateMonthlyReportPDF(dashboard.monthlySummaries, selectedYear);
          break;
        case 'tax':
          generateDepartmentReportPDF(dashboard.departmentSummaries, 'Tax Deduction Report');
          break;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    if (selectedReport === 'tax' || selectedReport === 'yearly') {
      // Fallback to client-side CSV for unsupported report types
      if (!dashboard) return;
      let csvContent = '';
      let filename = '';

      if (selectedReport === 'yearly') {
        csvContent = 'Month,Year,Employees,Total Paid,Average Salary\n';
        dashboard.monthlySummaries.forEach((month) => {
          csvContent += `${month.month},${month.year},${month.employeeCount},${month.totalPaid},${month.averageSalary}\n`;
        });
        filename = `yearly_report_${selectedYear}.csv`;
      } else {
        csvContent = 'Department,Employees,Total Salary,Average,Min,Max\n';
        dashboard.departmentSummaries.forEach((dept) => {
          csvContent += `${dept.department},${dept.employeeCount},${dept.totalSalary},${dept.averageSalary},${dept.minSalary},${dept.maxSalary}\n`;
        });
        filename = 'tax_report.csv';
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    try {
      const blob = await analyticsApi.exportReport(selectedReport, 'excel', selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_report_${selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const reportTypes = [
    { type: 'department' as ReportType, label: 'Department Summary', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { type: 'monthly' as ReportType, label: 'Monthly Report', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { type: 'yearly' as ReportType, label: 'Yearly Report', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { type: 'tax' as ReportType, label: 'Tax Deduction', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Generate and export payroll reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl shadow-sm p-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Report Type</h3>
            <div className="space-y-2">
              {reportTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedReport(type)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedReport === type
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  {label}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            {(selectedReport === 'monthly' || selectedReport === 'yearly') && (
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={`w-full px-3 py-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  } focus:outline-none`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Export Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating || !dashboard}
                className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 disabled:opacity-50'
                    : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                {isGenerating ? 'Generating...' : 'Export PDF'}
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!dashboard}
                className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30 disabled:opacity-50'
                    : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-3">
          <div className={`rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedReport === 'department' && 'Department Summary Report'}
                {selectedReport === 'monthly' && `Monthly Report - ${selectedYear}`}
                {selectedReport === 'yearly' && `Yearly Report - ${selectedYear}`}
                {selectedReport === 'tax' && 'Tax Deduction Report'}
              </h2>
            </div>

            {/* Department Summary */}
            {selectedReport === 'department' && dashboard && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employees</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Salary</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Range</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {dashboard.departmentSummaries.map((dept, index) => (
                      <tr key={index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{dept.employeeCount}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(dept.totalSalary)}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatCurrency(dept.averageSalary)}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {formatCurrency(dept.minSalary)} - {formatCurrency(dept.maxSalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</td>
                      <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dashboard.departmentSummaries.reduce((sum, d) => sum + d.employeeCount, 0)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(dashboard.departmentSummaries.reduce((sum, d) => sum + d.totalSalary, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Monthly Report */}
            {(selectedReport === 'monthly' || selectedReport === 'yearly') && dashboard && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Month</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employees</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Paid</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Change</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {dashboard.monthlySummaries.map((month, index) => {
                      const prevMonth = dashboard.monthlySummaries[index - 1];
                      const change = prevMonth
                        ? ((month.totalPaid - prevMonth.totalPaid) / prevMonth.totalPaid) * 100
                        : 0;
                      return (
                        <tr key={index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                          <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {month.month} {month.year}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{month.employeeCount}</td>
                          <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(month.totalPaid)}</td>
                          <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatCurrency(month.averageSalary)}</td>
                          <td className="px-6 py-4 text-sm">
                            {index > 0 && (
                              <span className={`flex items-center gap-1 ${change >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                                {change >= 0 ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>-</td>
                      <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(dashboard.monthlySummaries.reduce((sum, m) => sum + m.totalPaid, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Tax Report */}
            {selectedReport === 'tax' && dashboard && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Total Tax Collected</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-orange-300' : 'text-orange-900'}`}>{formatCurrency(dashboard.totalTaxDeducted)}</p>
                  </div>
                  <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Avg Tax per Employee</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                      {formatCurrency(dashboard.totalTaxDeducted / (dashboard.totalEmployees || 1))}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Tax Rate (Effective)</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>
                      {((dashboard.totalTaxDeducted / (dashboard.totalSalaryPaid || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employees</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Salary</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Est. Tax (10%)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {dashboard.departmentSummaries.map((dept, index) => (
                      <tr key={index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{dept.employeeCount}</td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatCurrency(dept.totalSalary)}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{formatCurrency(dept.totalSalary * 0.1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No data state */}
            {!dashboard && (
              <div className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Loading report data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
