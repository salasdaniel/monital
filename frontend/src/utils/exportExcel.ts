import * as XLSX from 'xlsx';

export interface ExcelColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

const fixMojibake = (value: string) => {
  if (!/[ÃÂâ]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded.includes('\uFFFD') ? value : decoded;
  } catch {
    return value;
  }
};

const normalizeValue = (value: unknown) =>
  typeof value === 'string' ? fixMojibake(value) : (value ?? '');

export function exportToExcel<T>(
  filename: string,
  sheetName: string,
  columns: ExcelColumn<T>[],
  rows: T[],
) {
  const data = [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => normalizeValue(column.value(row)))),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = columns.map((column, index) => ({
    wch: Math.min(
      50,
      Math.max(
        column.header.length,
        ...data.slice(1).map((row) => String(row[index] ?? '').length),
      ) + 2,
    ),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`, { compression: true });
}
