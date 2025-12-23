
export const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Date N hours ago */
export const getHoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};




export const groupByDate = (
  items: { createdAt: Date }[]
): { date: string; count: number }[] => {
  const map: Record<string, number> = {};

  items.forEach((item) => {
    const date = item.createdAt.toISOString().slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  });

  return Object.entries(map).map(([date, count]) => ({
    date,
    count,
  }));
};


export const groupByHour = (
  items: { createdAt: Date }[],
  step = 4
): { hour: string; count: number }[] => {
  const map: Record<string, number> = {};

  items.forEach((item) => {
    const hour = item.createdAt.getHours();
    const roundedHour = Math.floor(hour / step) * step;
    const label = `${String(roundedHour).padStart(2, "0")}:00`;

    map[label] = (map[label] || 0) + 1;
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({
      hour,
      count,
    }));
};


export const creditsToTokens = (credits: number) => {
  return credits * 1000;
};


export const calculateTotalTokens = (
  items: { creditsUsed: number }[]
) => {
  return items.reduce(
    (total, item) => total + creditsToTokens(item.creditsUsed),
    0
  );
};

export const SUBSCRIPTION_PRICE_MAP: Record<string, number> = {
  FREE: 0,
  BASIC: 29,
  PRO: 79,
  ENTERPRISE: 199,
};
