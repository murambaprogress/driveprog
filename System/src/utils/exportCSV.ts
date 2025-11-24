// Simple CSV export helper
export function exportToCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows || !rows.length) {
    const blob = new Blob([""], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(
    rows.map(row => keys.map(k => {
      const v = row[k] == null ? '' : String(row[k]);
      // escape quotes
      return `"${v.replace(/"/g, '""')}"`;
    }).join(','))
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
