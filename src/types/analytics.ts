export interface DepartmentSummary {
  department: string;
  employeeCount: number;
  totalSalary: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalPaid: number;
  employeeCount: number;
  averageSalary: number;
}

export interface YearlySummary {
  year: number;
  totalPaid: number;
  employeeCount: number;
  averageSalary: number;
  monthlyBreakdown: MonthlySummary[];
}

export interface TaxSummary {
  totalTaxCollected: number;
  taxByDepartment: {
    department: string;
    taxAmount: number;
  }[];
  taxByMonth: {
    month: string;
    taxAmount: number;
  }[];
}

export interface AnalyticsDashboard {
  totalEmployees: number;
  totalSalaryPaid: number;
  averageSalary: number;
  totalTaxDeducted: number;
  departmentSummaries: DepartmentSummary[];
  monthlySummaries: MonthlySummary[];
  recentUploads: {
    filename: string;
    uploadedAt: string;
    recordCount: number;
  }[];
}

export interface SalaryTrend {
  date: string;
  amount: number;
  employer?: string;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface SearchFilters {
  pan?: string;
  name?: string;
  department?: string;
  dateRange?: DateRange;
  minSalary?: number;
  maxSalary?: number;
}

export interface AutocompleteResult {
  pan: string;
  name: string;
  department?: string;
}

// ===== API Response Types =====
// These types match the actual backend API responses

export interface DashboardStatsAPI {
  totalEmployees: number;
  totalRecords: number;
  totalPaid: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface DepartmentSummaryAPI {
  department: string;
  employeeCount: number;
  totalPaid: number;
  avgSalary: number;
  recordCount: number;
}

export interface MonthlyReportMonthAPI {
  month: number;
  employeeCount: number;
  totalPaid: number;
  avgSalary: number;
}

export interface MonthlyReportAPI {
  year: number;
  months: MonthlyReportMonthAPI[];
  yearTotal: number;
}

export interface YearlyDataAPI {
  year: number;
  employeeCount: number;
  totalPaid: number;
  avgSalary: number;
}

export interface TopEarnerAPI {
  pan: string;
  name: string;
  totalEarnings: number;
  avgSalary: number;
  recordCount: number;
  department: string;
}

export interface SearchResultAPI {
  pan: string;
  name: string;
}
