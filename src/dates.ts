export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function parseLocalDate(value: string): Date { const [y,m,d] = value.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0, 0); }
export function dayDiff(from: string, to: string): number { const a = parseLocalDate(from); const b = parseLocalDate(to); return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()) - Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())) / 86400000); }
export function dateLabel(value: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) { return parseLocalDate(value).toLocaleDateString(undefined, options); }
export function datesBetween(start: string, end: string, limit = 500): string[] { if (!start || !end || start > end) return []; const out: string[] = []; const d = parseLocalDate(start); while (isoDate(d) <= end && out.length < limit) { out.push(isoDate(d)); d.setDate(d.getDate()+1); } return out; }
export function isTaskOnDate(task: {startDate:string; endDate:string; recurrence?:string}, date: string): boolean {
  if (task.recurrence === 'daily') return date >= task.startDate && date <= task.endDate;
  if (task.recurrence === 'weekly') { if (date < task.startDate || date > task.endDate) return false; return parseLocalDate(date).getDay() === parseLocalDate(task.startDate).getDay(); }
  if (task.recurrence === 'monthly') { if (date < task.startDate || date > task.endDate) return false; return parseLocalDate(date).getDate() === parseLocalDate(task.startDate).getDate(); }
  return date >= task.startDate && date <= task.endDate;
}
export function getDaysRemaining(target: string, today = isoDate(new Date())): number { return dayDiff(today, target); }
