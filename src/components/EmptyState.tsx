import { useThemeStore } from '../stores/themeStore';
import { Search, FileText, BarChart3, Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: 'search' | 'document' | 'chart' | 'inbox';
}

const icons = {
  search: Search,
  document: FileText,
  chart: BarChart3,
  inbox: Inbox,
};

export function EmptyState({ message = 'No information available', icon = 'inbox' }: EmptyStateProps) {
  const { isDarkMode } = useThemeStore();
  const IconComponent = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <IconComponent
          className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
          strokeWidth={1.5}
        />
      </div>
      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message}
      </p>
    </div>
  );
}
