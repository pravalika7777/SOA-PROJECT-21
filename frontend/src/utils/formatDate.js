export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const calculateDueDate = (issueDateString, loanDays = 14) => {
  if (!issueDateString) return '—';
  try {
    const date = new Date(issueDateString);
    if (isNaN(date.getTime())) return '—';
    date.setDate(date.getDate() + loanDays);
    return formatDate(date);
  } catch {
    return '—';
  }
};
