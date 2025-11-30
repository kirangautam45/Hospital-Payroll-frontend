import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PersonResponse, SalaryRecord } from '../types/api';
import type { DepartmentSummary, MonthlySummary } from '../types/analytics';

export function generateSalaryHistoryPDF(data: PersonResponse): void {
  const doc = new jsPDF();
  const { person, salaryRecords } = data;

  // Title
  doc.setFontSize(20);
  doc.text('Salary History Report', 105, 20, { align: 'center' });

  // Person Details
  doc.setFontSize(12);
  doc.text(`PAN: ${person.pan}`, 14, 35);
  doc.text(`Name: ${person.name || 'N/A'}`, 14, 42);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 49);

  // Salary History Table
  const tableData = salaryRecords.map((record: SalaryRecord) => [
    record.employer,
    `${record.currency} ${record.salaryAmount.toLocaleString()}`,
    new Date(record.effectiveFrom).toLocaleDateString(),
    record.source,
    new Date(record.uploadedAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Employer', 'Salary', 'Effective From', 'Source', 'Uploaded']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Summary
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total Records: ${salaryRecords.length}`, 14, finalY);

  // Save
  doc.save(`${person.pan}_salary_history.pdf`);
}

export function generateDepartmentReportPDF(
  departments: DepartmentSummary[],
  title: string = 'Department Summary Report'
): void {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(title, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Summary Stats
  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const totalSalary = departments.reduce((sum, d) => sum + d.totalSalary, 0);

  doc.setFontSize(12);
  doc.text(`Total Employees: ${totalEmployees}`, 14, 45);
  doc.text(`Total Salary: INR ${totalSalary.toLocaleString()}`, 14, 52);

  // Department Table
  const tableData = departments.map((dept) => [
    dept.department,
    dept.employeeCount.toString(),
    `INR ${dept.totalSalary.toLocaleString()}`,
    `INR ${dept.averageSalary.toLocaleString()}`,
    `INR ${dept.minSalary.toLocaleString()}`,
    `INR ${dept.maxSalary.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Department', 'Employees', 'Total', 'Average', 'Min', 'Max']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
  });

  doc.save('department_summary.pdf');
}

export function generateMonthlyReportPDF(
  monthlySummaries: MonthlySummary[],
  year: number = new Date().getFullYear()
): void {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`Monthly Salary Report - ${year}`, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Summary Stats
  const totalPaid = monthlySummaries.reduce((sum, m) => sum + m.totalPaid, 0);
  const avgMonthly = totalPaid / (monthlySummaries.length || 1);

  doc.setFontSize(12);
  doc.text(`Total Paid (Year): INR ${totalPaid.toLocaleString()}`, 14, 45);
  doc.text(`Monthly Average: INR ${avgMonthly.toLocaleString()}`, 14, 52);

  // Monthly Table
  const tableData = monthlySummaries.map((month) => [
    `${month.month} ${month.year}`,
    month.employeeCount.toString(),
    `INR ${month.totalPaid.toLocaleString()}`,
    `INR ${month.averageSalary.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Month', 'Employees', 'Total Paid', 'Average Salary']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
  });

  doc.save(`monthly_report_${year}.pdf`);
}

export function generatePayslipPDF(
  employee: { name: string; pan: string; department?: string },
  salary: SalaryRecord,
  deductions: { name: string; amount: number }[] = []
): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.text('PAYSLIP', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Pay Period: ${new Date(salary.effectiveFrom).toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Company Info (placeholder)
  doc.setFontSize(12);
  doc.text('Hospital Payroll System', 14, 45);
  doc.setFontSize(10);
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 52);

  // Employee Details Box
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 60, 180, 30);
  doc.setFontSize(11);
  doc.text('Employee Details', 18, 68);
  doc.setFontSize(10);
  doc.text(`Name: ${employee.name}`, 18, 76);
  doc.text(`PAN: ${employee.pan}`, 18, 83);
  doc.text(`Department: ${employee.department || 'N/A'}`, 100, 76);
  doc.text(`Employer: ${salary.employer}`, 100, 83);

  // Earnings
  doc.rect(14, 100, 85, 50);
  doc.setFontSize(11);
  doc.text('Earnings', 18, 108);
  doc.setFontSize(10);
  doc.text('Basic Salary:', 18, 118);
  doc.text(`${salary.currency} ${salary.salaryAmount.toLocaleString()}`, 70, 118, { align: 'right' });

  // Deductions
  doc.rect(109, 100, 85, 50);
  doc.setFontSize(11);
  doc.text('Deductions', 113, 108);
  doc.setFontSize(10);

  let deductionY = 118;
  let totalDeductions = 0;
  deductions.forEach((d) => {
    doc.text(`${d.name}:`, 113, deductionY);
    doc.text(`${salary.currency} ${d.amount.toLocaleString()}`, 185, deductionY, { align: 'right' });
    totalDeductions += d.amount;
    deductionY += 8;
  });

  // Net Pay
  const netPay = salary.salaryAmount - totalDeductions;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 160, 180, 20, 'F');
  doc.setFontSize(14);
  doc.text('Net Pay:', 18, 173);
  doc.text(`${salary.currency} ${netPay.toLocaleString()}`, 185, 173, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.text('This is a computer generated payslip', 105, 200, { align: 'center' });

  doc.save(`payslip_${employee.pan}_${new Date(salary.effectiveFrom).toISOString().slice(0, 7)}.pdf`);
}
