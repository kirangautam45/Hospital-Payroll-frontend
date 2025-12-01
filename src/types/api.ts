export interface UploadedRecord {
  pan: string;
  name?: string;
  nameNepali?: string;
  position?: string;
  positionNepali?: string;
  department?: string;
  departmentNepali?: string;
  accountNumber?: string;
  dutyDays?: {
    month1?: number;
    month2?: number;
    month3?: number;
    total?: number;
  };
  rate?: number;
  grossAmount?: number;
  taxDeduction?: number;
  netSalary: number;
}

export interface UploadFileResult {
  filename: string;
  rowsRead: number;
  inserted: number;
  skipped: number;
  errors: string[];
  records: UploadedRecord[];
}

export interface UploadResponse {
  filesProcessed: number;
  totalRowsRead: number;
  totalInserted: number;
  totalSkipped: number;
  files: UploadFileResult[];
}

export interface SalaryRecord {
  _id: string;
  pan: string;
  employer: string;
  salaryAmount: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  source: string;
  uploadedAt: string;
  rowHash: string;
}

export interface Person {
  _id: string;
  pan: string;
  name: string;
  nameNepali?: string;
  position?: string;
  positionNepali?: string;
  department?: string;
  departmentNepali?: string;
  dob: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PersonResponse {
  person: Person;
  salaryRecords: SalaryRecord[];
  pagination: Pagination;
}

export interface PersonSummary {
  person: Pick<Person, '_id' | 'pan' | 'name'>;
  summary: {
    totalRecords: number;
    latestSalary: {
      amount: number;
      currency: string;
      employer: string;
      effectiveFrom: string;
    };
    firstSalary: {
      amount: number;
      currency: string;
      employer: string;
      effectiveFrom: string;
    };
    percentChange: number;
  };
}

export interface ApiError {
  error: string;
}

export interface AllPersonsResponse {
  persons: Person[];
  pagination: Pagination;
}

export interface SalaryRecordFull {
  _id: string;
  pan: string;
  name?: string;
  nameNepali?: string;
  position?: string;
  positionNepali?: string;
  department?: string;
  departmentNepali?: string;
  accountNumber?: string;
  dutyDays?: {
    month1?: number;
    month2?: number;
    month3?: number;
    total?: number;
  };
  rate?: number;
  grossAmount?: number;
  taxDeduction?: number;
  netSalary: number;
  uploadedAt: string;
  source?: string;
}

export interface SalaryRecordTotals {
  totalGross: number;
  totalNet: number;
  totalTax: number;
}

export interface AllSalaryRecordsResponse {
  records: SalaryRecordFull[];
  totals: SalaryRecordTotals;
  pagination: Pagination;
}

// Pharmacy Types
export interface PharmacyRecord {
  _id: string;
  pan: string;
  name?: string;
  position?: string;
  nightDutyCount?: number;
  rate?: number;
  grossAmount?: number;
  taxDeduction?: number;
  netPayable?: number;
  accountNumber?: string;
  source?: string;
  uploadedAt: string;
}

export interface PharmacyUploadFileResult {
  filename: string;
  rowsRead: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  records: Partial<PharmacyRecord>[];
}

export interface PharmacyUploadResponse {
  filesProcessed: number;
  totalRowsRead: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  files: PharmacyUploadFileResult[];
}

export interface PharmacyRecordTotals {
  totalGross: number;
  totalNet: number;
  totalTax: number;
}

export interface AllPharmacyRecordsResponse {
  records: PharmacyRecord[];
  totals: PharmacyRecordTotals;
  pagination: Pagination;
}
