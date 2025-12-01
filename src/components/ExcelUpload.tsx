import { useState, useCallback, useRef } from 'react';
import { parseExcelFile, validateExcelStructure } from '../utils/excelParser';
import type { UploadResult, UploadProgress } from '../types/employee';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface ExcelUploadProps {
  onUploadComplete: (result: UploadResult) => void;
}

export function ExcelUpload({ onUploadComplete }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    percentage: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setProgress({ status: 'reading', percentage: 10, message: 'Reading file...' });

    try {
      // Validate file structure
      setProgress({ status: 'validating', percentage: 30, message: 'Validating file structure...' });
      const validation = await validateExcelStructure(file);

      if (!validation.valid) {
        setError(validation.message);
        setProgress({ status: 'error', percentage: 0, message: validation.message });
        return;
      }

      // Parse Excel file
      setProgress({ status: 'processing', percentage: 60, message: 'Processing data...' });
      const result = await parseExcelFile(file);

      setProgress({ status: 'complete', percentage: 100, message: 'Upload complete!' });
      onUploadComplete(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      setProgress({ status: 'error', percentage: 0, message: errorMessage });
    }
  }, [onUploadComplete]);

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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setProgress({ status: 'idle', percentage: 0, message: '' });
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${progress.status === 'error' ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {progress.status === 'idle' && (
          <>
            <div className="mb-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Drag and drop your Excel file here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              onClick={handleBrowseClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Supports .xlsx, .xls, and .csv files (max 10MB)
            </p>
          </>
        )}

        {/* Progress State */}
        {(progress.status === 'reading' || progress.status === 'validating' || progress.status === 'processing') && (
          <div className="py-4">
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
            <p className="text-gray-600">{progress.message}</p>
          </div>
        )}

        {/* Complete State */}
        {progress.status === 'complete' && (
          <div className="py-4">
            <div className="mb-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            </div>
            <p className="text-green-600 font-medium mb-4">{progress.message}</p>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}

        {/* Error State */}
        {progress.status === 'error' && error && (
          <div className="py-4">
            <div className="mb-4">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
