export function formatAppDate(date: Date): string {
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
  ].join('-');
}

export function formatAppDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  if (!year || !month || !day) return dateKey;
  return `${day}-${month}-${year}`;
}

export function formatAppDateTime(date: Date): string {
  const hour12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = date.getHours() < 12 ? 'AM' : 'PM';
  const time = `${hour12}:${minutes} ${meridiem}`;
  return `${formatAppDate(date)} ${time}`;
}

export function formatAppFileDateTime(date: Date): string {
  const hour = date.getHours();
  const hour12 = hour % 12 || 12;
  const meridiem = hour < 12 ? 'am' : 'pm';
  return `${formatAppDate(date)} ${hour12}${meridiem}`;
}
