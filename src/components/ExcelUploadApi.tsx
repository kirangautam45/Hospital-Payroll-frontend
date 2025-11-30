import { useState, useCallback, useRef } from 'react';
import { uploadApi } from '../utils/api';
import type { UploadResponse } from '../types/api';
import { AxiosError } from 'axios';

interface ExcelUploadApiProps {
  onUploadComplete: (result: UploadResponse) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

export function ExcelUploadApi({ onUploadComplete }: ExcelUploadApiProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const validExtensions = ['.xlsx', '.xls'];

    files.forEach((file) => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

      if (!validExtensions.includes(ext)) {
        errors.push(`${file.name}: Invalid file type. Only .xlsx and .xls allowed.`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File exceeds 25MB limit.`);
      } else {
        valid.push(file);
      }
    });

    if (valid.length > 10) {
      errors.push('Maximum 10 files allowed at once.');
      return { valid: valid.slice(0, 10), errors };
    }

    return { valid, errors };
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    setSelectedFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 10);
    });
  }, []);

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
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setStatus('uploading');
    setError(null);

    try {
      const result = await uploadApi.uploadFiles(selectedFiles);
      setStatus('complete');
      setSelectedFiles([]);
      onUploadComplete(result);
    } catch (err) {
      setStatus('error');
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  const resetUpload = () => {
    setStatus('idle');
    setError(null);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${status === 'error' ? 'border-red-300 bg-red-50' : ''}
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
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Drag and drop Excel files here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Supports .xlsx and .xls files (max 25MB each, up to 10 files)
            </p>
          </>
        )}

        {status === 'uploading' && (
          <div className="py-8">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Uploading {selectedFiles.length} file(s)...</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
          {error}
          {status === 'error' && (
            <button
              onClick={resetUpload}
              className="block mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && status === 'idle' && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
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
            onClick={handleUpload}
            className="mt-4 w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
