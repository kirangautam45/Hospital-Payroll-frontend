export interface Employee {
  sn: number;                    // l;=g++ (Serial Number)
  employeeId?: string;           // kb (Employee ID)
  name: string;                  // gfdy/ (Name)
  designation?: string;          // kb (Pad/Position)
  department?: string;           // sfo{/t ljefu (Working Department)
  panNumber: string;             // kfg g+= (PAN Number)
  accountNumber?: string;        // vftf g+= (Account Number)
  salaryPeriod?: string;         // माघ देखी c;f/ ;Dd (Salary Period)
  allowance?: number;            // >fj)f (Bharana/Allowance)
  bhadi?: number;                // efb| (Bhadi)
  total?: number;                // hDdf (Jamma/Total)
  rate?: number;                 // b/ (Dar/Rate)
  grossAmount?: number;          // kfpg] /sd (Paune Rakam)
  tax?: number;                  // kfl/>lds s/ (Professional Tax)
  netPayable?: number;           // s'n kfpg] (Kul Paune/Net Payable) - can be null/0
}

export interface UploadResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  duplicates: number;
  errors: ValidationError[];
  data: Employee[];
}

export interface SheetResult {
  sheetName: string;
  result: UploadResult;
}

export interface MultiSheetUploadResult {
  success: boolean;
  totalSheets: number;
  sheets: SheetResult[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: unknown;
}

export interface UploadProgress {
  status: 'idle' | 'reading' | 'validating' | 'processing' | 'complete' | 'error';
  percentage: number;
  message: string;
}
