import { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Layout } from '../components/Layout';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useThemeStore } from '../stores/themeStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function Analytics() {
  const { dashboard, isLoading, fetchDashboard } = useAnalyticsStore();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Transform department data for pie chart
  const pieChartData = useMemo(() => {
    return dashboard?.departmentSummaries?.map(dept => ({
      name: dept.department,
      value: dept.employeeCount,
    })) || [];
  }, [dashboard?.departmentSummaries]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overview of payroll statistics and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Employees</p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dashboard?.totalEmployees || 0}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Salary Paid</p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(dashboard?.totalSalaryPaid || 0)}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Salary</p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{formatCurrency(dashboard?.averageSalary || 0)}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tax Deducted</p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{formatCurrency(dashboard?.totalTaxDeducted || 0)}</p>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Salary Trend */}
        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Monthly Salary Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboard?.monthlySummaries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              />
              <Area type="monotone" dataKey="totalPaid" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Paid" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Department Salary Comparison */}
        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Department Salary Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard?.departmentSummaries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="department" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              />
              <Legend />
              <Bar dataKey="averageSalary" name="Average" fill="#8b5cf6" />
              <Bar dataKey="maxSalary" name="Max" fill="#10b981" />
              <Bar dataKey="minSalary" name="Min" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Count Trend */}
        <div className={`rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Employee Count Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard?.monthlySummaries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="employeeCount" stroke="#8b5cf6" name="Employees" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employees</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Salary</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {dashboard?.departmentSummaries?.map((dept, index) => (
                <tr key={index} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{dept.employeeCount}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(dept.totalSalary)}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatCurrency(dept.averageSalary)}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatCurrency(dept.minSalary)}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{formatCurrency(dept.maxSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Uploads</h3>
        </div>
        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {dashboard?.recentUploads?.map((upload, index) => (
            <div key={index} className={`px-6 py-4 flex justify-between items-center ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{upload.filename}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(upload.uploadedAt).toLocaleString()}</p>
                </div>
              </div>
              <span className={`text-sm px-3 py-1 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {upload.recordCount} records
              </span>
            </div>
          ))}
          {(!dashboard?.recentUploads || dashboard.recentUploads.length === 0) && (
            <div className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p>No recent uploads</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
