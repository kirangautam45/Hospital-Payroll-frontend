import * as XLSX from 'xlsx';
import type { Employee, ValidationError, UploadResult, MultiSheetUploadResult, SheetResult } from '../types/employee';

// Expected column headers (Nepali)
const EXPECTED_HEADERS = [
  'l;=g++',           // S.N.
  'gfdy/',            // Name
  'kb',               // Designation
  'sfo{/t ljefu',     // Department
  'kfg g+=',          // PAN Number
  'vftf g+=',         // Account Number
  '>fj)f',            // Allowance
  'efb|',             // Bhadi
  'hDdf',             // Total
  'b/',               // Rate
  'kfpg] /sd',        // Gross Amount
  'kfl/>lds s/',      // Tax
  "s'n kfpg]",        // Net Payable
];

// Column mapping from Nepali to English keys
const COLUMN_MAP: Record<string, keyof Employee> = {
  'l;=g++': 'sn',
  'gfdy/': 'name',
  'kb': 'designation',
  'sfo{/t ljefu': 'department',
  'kfg g+=': 'panNumber',
  'vftf g+=': 'accountNumber',
  '>fj)f': 'allowance',
  'efb|': 'bhadi',
  'hDdf': 'total',
  'b/': 'rate',
  'kfpg] /sd': 'grossAmount',
  'kfl/>lds s/': 'tax',
  "s'n kfpg]": 'netPayable',
};

export function parseExcelFile(file: File): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
        });

        if (jsonData.length === 0) {
          resolve({
            success: false,
            totalRows: 0,
            validRows: 0,
            duplicates: 0,
            errors: [{ row: 0, field: '', message: 'Excel file is empty', value: null }],
            data: [],
          });
          return;
        }

        // Validate and parse data
        const result = processExcelData(jsonData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

function processExcelData(jsonData: Record<string, unknown>[]): UploadResult {
  const errors: ValidationError[] = [];
  const employees: Employee[] = [];
  const seenIds = new Set<string>();
  let duplicates = 0;

  jsonData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header row and 0-based index
    const employee = mapRowToEmployee(row, rowNumber, errors);

    if (employee) {
      // Check for duplicates based on PAN or Account Number
      const uniqueKey = employee.panNumber || employee.accountNumber;

      if (uniqueKey && seenIds.has(uniqueKey)) {
        duplicates++;
        errors.push({
          row: rowNumber,
          field: 'panNumber/accountNumber',
          message: 'Duplicate entry detected',
          value: uniqueKey,
        });
      } else {
        if (uniqueKey) seenIds.add(uniqueKey);
        employees.push(employee);
      }
    }
  });

  return {
    success: errors.filter(e => !e.message.includes('Duplicate')).length === 0,
    totalRows: jsonData.length,
    validRows: employees.length,
    duplicates,
    errors,
    data: employees,
  };
}

function mapRowToEmployee(
  row: Record<string, unknown>,
  rowNumber: number,
  errors: ValidationError[]
): Employee | null {
  const employee: Partial<Employee> = {};
  const keys = Object.keys(row);

  // Try to map each column
  keys.forEach((key) => {
    const normalizedKey = key.trim();
    const mappedField = COLUMN_MAP[normalizedKey];

    if (mappedField) {
      const value = row[key];

      // Convert numeric fields
      if (['sn', 'allowance', 'bhadi', 'total', 'rate', 'grossAmount', 'tax', 'netPayable'].includes(mappedField)) {
        const numValue = parseFloat(String(value));
        if (isNaN(numValue) && value !== '' && value !== null) {
          errors.push({
            row: rowNumber,
            field: mappedField,
            message: `Invalid number format`,
            value,
          });
        }
        (employee as Record<string, unknown>)[mappedField] = isNaN(numValue) ? 0 : numValue;
      } else {
        (employee as Record<string, unknown>)[mappedField] = String(value || '').trim();
      }
    }
  });

  // Validate required fields
  if (!employee.name) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'Name is required',
      value: employee.name,
    });
    return null;
  }

  // Set defaults for missing fields
  return {
    sn: employee.sn || rowNumber - 1,
    employeeId: employee.employeeId || `EMP-${rowNumber}`,
    name: employee.name || '',
    designation: employee.designation || '',
    department: employee.department || '',
    panNumber: employee.panNumber || '',
    accountNumber: employee.accountNumber || '',
    salaryPeriod: employee.salaryPeriod || '',
    allowance: employee.allowance || 0,
    bhadi: employee.bhadi || 0,
    total: employee.total || 0,
    rate: employee.rate || 0,
    grossAmount: employee.grossAmount || 0,
    tax: employee.tax || 0,
    netPayable: employee.netPayable || 0,
  };
}

export function parseExcelFileAllSheets(file: File): Promise<MultiSheetUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheets: SheetResult[] = [];
        let overallSuccess = true;

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
            defval: '',
          });

          if (jsonData.length === 0) {
            sheets.push({
              sheetName,
              result: {
                success: true,
                totalRows: 0,
                validRows: 0,
                duplicates: 0,
                errors: [],
                data: [],
              },
            });
          } else {
            const result = processExcelData(jsonData);
            if (!result.success) {
              overallSuccess = false;
            }
            sheets.push({
              sheetName,
              result,
            });
          }
        });

        resolve({
          success: overallSuccess,
          totalSheets: workbook.SheetNames.length,
          sheets,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function validateExcelStructure(file: File): Promise<{ valid: boolean; message: string }> {
  return new Promise((resolve) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      resolve({
        valid: false,
        message: 'Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.',
      });
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      resolve({
        valid: false,
        message: 'File size exceeds 10MB limit.',
      });
      return;
    }

    resolve({ valid: true, message: 'File structure is valid.' });
  });
}

export { EXPECTED_HEADERS };
