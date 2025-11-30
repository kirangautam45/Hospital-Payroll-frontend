import { create } from 'zustand';
import type {
  AnalyticsDashboard,
  DateRange,
  AutocompleteResult
} from '../types/analytics';
import { analyticsApi, personApi } from '../utils/api';

interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  isLoading: boolean;
  error: string | null;
  selectedDateRange: DateRange;
  autocompleteResults: AutocompleteResult[];
  isSearching: boolean;
}

interface AnalyticsActions {
  fetchDashboard: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
  searchPan: (query: string) => Promise<void>;
  clearAutocomplete: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  // State
  dashboard: null,
  isLoading: false,
  error: null,
  selectedDateRange: { startDate: null, endDate: null },
  autocompleteResults: [],
  isSearching: false,

  // Actions
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const [stats, deptData, monthlyData] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getDepartmentSummary(),
        analyticsApi.getMonthlyReport(),
      ]);

      const dashboard: AnalyticsDashboard = {
        totalEmployees: stats.totalEmployees,
        totalSalaryPaid: stats.totalPaid,
        averageSalary: stats.averageSalary,
        totalTaxDeducted: 0,
        departmentSummaries: deptData.departments.map(d => ({
          department: d.department,
          employeeCount: d.employeeCount,
          totalSalary: d.totalPaid,
          averageSalary: d.avgSalary,
          minSalary: 0,
          maxSalary: 0,
        })),
        monthlySummaries: monthlyData.months.map(m => ({
          month: MONTH_NAMES[m.month - 1],
          year: monthlyData.year,
          totalPaid: m.totalPaid,
          employeeCount: m.employeeCount,
          averageSalary: m.avgSalary,
        })),
        recentUploads: [],
      };

      set({ dashboard, isLoading: false });
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      set({
        error: error.response?.data?.error || 'Failed to fetch analytics',
        isLoading: false
      });
    }
  },

  setDateRange: (range: DateRange) => {
    set({ selectedDateRange: range });
  },

  searchPan: async (query: string) => {
    if (query.length < 2) {
      set({ autocompleteResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const { results } = await personApi.search(query, 10);
      set({
        autocompleteResults: results.map(r => ({ pan: r.pan, name: r.name })),
        isSearching: false
      });
    } catch {
      set({ autocompleteResults: [], isSearching: false });
    }
  },

  clearAutocomplete: () => {
    set({ autocompleteResults: [] });
  },
}));
