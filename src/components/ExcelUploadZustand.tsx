import { useCallback, useRef, useState } from 'react';
import { useUploadStore } from '../stores/uploadStore';
import { useThemeStore } from '../stores/themeStore';
import { CloudUpload, Check, XCircle, FileSpreadsheet, X } from 'lucide-react';

export function ExcelUploadZustand() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useThemeStore();

  const { status, selectedFiles, error, addFiles, removeFile, uploadFiles, reset } = useUploadStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  }, [addFiles]);

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging
            ? isDarkMode
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-blue-500 bg-blue-50'
            : isDarkMode
              ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              : 'border-gray-300 bg-gray-50/50 hover:border-gray-400'
          }
          ${status === 'error'
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
            <div className={`mb-4 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <CloudUpload className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} strokeWidth={1.5} />
            </div>
            <p className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Drag and drop Excel files here
            </p>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>or click to browse</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-6 py-2.5 font-medium rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
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
              <div className={`absolute inset-0 rounded-full border-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Uploading {selectedFiles.length} file(s)...
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we process your files
            </p>
          </div>
        )}

        {status === 'complete' && (
          <div className="py-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <Check className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Upload complete!</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your files have been processed successfully
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`mt-4 p-4 rounded-xl text-sm ${
          isDarkMode
            ? 'bg-red-900/20 border border-red-800 text-red-400'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="whitespace-pre-line">{error}</p>
              {status === 'error' && (
                <button
                  onClick={reset}
                  className={`mt-2 font-medium ${isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-800'}`}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && status === 'idle' && (
        <div className="mt-4">
          <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700/50 hover:bg-gray-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  }`}>
                    <FileSpreadsheet className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{file.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={uploadFiles}
            className={`mt-4 w-full py-3 font-semibold rounded-lg transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
            }`}
          >
            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
