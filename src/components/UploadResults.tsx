import type { UploadResult } from '../types/employee';

interface UploadResultsProps {
  result: UploadResult;
  onClear: () => void;
}

export function UploadResults({ result, onClear }: UploadResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Rows</p>
          <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Valid Rows</p>
          <p className="text-2xl font-bold text-green-600">{result.validRows}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Duplicates</p>
          <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Errors</p>
          <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          {result.success ? (
            <>
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">File processed successfully!</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-700 font-medium">File processed with warnings. Review errors below.</span>
            </>
          )}
        </div>
      </div>

      {/* Errors Table */}
      {result.errors.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Errors & Warnings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.errors.slice(0, 10).map((error, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{error.row}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{error.field}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{error.message}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">
                      {String(error.value || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.errors.length > 10 && (
              <div className="px-4 py-3 text-sm text-gray-500 border-t">
                Showing 10 of {result.errors.length} errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Preview */}
      {result.data.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.N.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Payable</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.data.slice(0, 10).map((employee, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.sn}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{employee.designation || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{employee.department || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{employee.panNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {(employee.netPayable ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.data.length > 10 && (
              <div className="px-4 py-3 text-sm text-gray-500 border-t">
                Showing 10 of {result.data.length} records
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onClear}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Upload Another File
        </button>
        {result.success && result.data.length > 0 && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save to Database
          </button>
        )}
      </div>
    </div>
  );
}
