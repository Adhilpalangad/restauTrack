import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, parseISO, isValid } from 'date-fns';

export const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const getYesterday = () => format(subDays(new Date(), 1), 'yyyy-MM-dd');

export const formatDateId = (date) => format(date, 'yyyy-MM-dd');

export const formatDisplayDate = (dateStr) => {
  const date = parseISO(dateStr);
  return format(date, 'EEE, d MMM yyyy');
};

export const formatShortDate = (dateStr) => {
  const date = parseISO(dateStr);
  return format(date, 'd MMM');
};

export const isValidDate = (dateStr) => {
  try {
    return isValid(parseISO(dateStr));
  } catch {
    return false;
  }
};

export const getDateRange = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { start: getToday(), end: getToday() };
    case 'yesterday':
      return { start: getYesterday(), end: getYesterday() };
    case 'thisWeek':
      return {
        start: formatDateId(startOfWeek(now, { weekStartsOn: 1 })),
        end: formatDateId(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case 'thisMonth':
      return {
        start: formatDateId(startOfMonth(now)),
        end: formatDateId(endOfMonth(now)),
      };
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return {
        start: formatDateId(startOfMonth(lastMonth)),
        end: formatDateId(endOfMonth(lastMonth)),
      };
    }
    case 'thisQuarter':
      return {
        start: formatDateId(startOfQuarter(now)),
        end: formatDateId(endOfQuarter(now)),
      };
    case 'thisYear':
      return {
        start: formatDateId(startOfYear(now)),
        end: formatDateId(endOfYear(now)),
      };
    default:
      return { start: getToday(), end: getToday() };
  }
};

export const getDaysInRange = (startStr, endStr) => {
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  const days = [];
  let current = start;
  while (current <= end) {
    days.push(formatDateId(current));
    current = new Date(current.getTime() + 86400000);
  }
  return days;
};
