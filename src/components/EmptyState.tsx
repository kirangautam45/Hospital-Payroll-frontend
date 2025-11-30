import { useThemeStore } from '../stores/themeStore';

interface EmptyStateProps {
  message?: string;
  icon?: 'search' | 'document' | 'chart' | 'inbox';
}

const icons = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
};

export function EmptyState({ message = 'No information available', icon = 'inbox' }: EmptyStateProps) {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <svg
          className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[icon]} />
        </svg>
      </div>
      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message}
      </p>
    </div>
  );
}
