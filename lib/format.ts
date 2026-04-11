const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return dateTimeFormatter.format(date);
}
