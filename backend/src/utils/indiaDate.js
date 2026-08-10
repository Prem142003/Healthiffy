export const INDIA_TIME_ZONE = 'Asia/Kolkata';

const indiaDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: INDIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export const getIndiaDateKey = (value = new Date()) => {
  const parts = Object.fromEntries(
    indiaDateFormatter
      .formatToParts(new Date(value))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const dateKeyToIndiaStart = (dateKey) =>
  new Date(`${dateKey}T00:00:00.000+05:30`);

export const getIndiaDayRange = (value = new Date()) => {
  const dateKey = getIndiaDateKey(value);
  return {
    dateKey,
    start: dateKeyToIndiaStart(dateKey),
    end: dateKeyToIndiaStart(addDaysToDateKey(dateKey, 1))
  };
};

export const getIndiaMonthRange = (value = new Date()) => {
  const dateKey = getIndiaDateKey(value);
  const [year, month] = dateKey.split('-').map(Number);
  const startKey = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const endKey = nextMonth.toISOString().slice(0, 10);

  return {
    start: dateKeyToIndiaStart(startKey),
    end: dateKeyToIndiaStart(endKey)
  };
};

