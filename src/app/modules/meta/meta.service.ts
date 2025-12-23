/* ================= ADMIN DASHBOARD META ================= */

import { prisma } from "../../prisma/prisma";

const getAdminDashboardMeta = async () => {
  const [
    totalUsers,
    activeSubscriptions,
    aiGenerationsToday,
    monthlyRevenue,
    projectAnalytics,
    aiGenerationStatistics,
  ] = await Promise.all([
    getTotalUsers(),
    getActiveSubscriptions(),
    getAiGenerationsToday(),
    getMonthlyRevenue(),
    getProjectAnalyticsLast7Days(),
    getAiGenerationLast24Hours(),
  ]);

  return {
    overview: {
      totalUsers,
      activeSubscriptions,
      aiGenerationsToday,
      monthlyRevenue,
    },
    projectAnalytics,
    aiGenerationStatistics,
  };
};

/* ================= OVERVIEW ================= */

const getTotalUsers = async () => {
  return prisma.user.count();
};

const getActiveSubscriptions = async () => {
  return prisma.subscription.count({
    where: { status: "ACTIVE" },
  });
};

const getAiGenerationsToday = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.creditUsage.count({
    where: {
      createdAt: { gte: startOfDay },
    },
  });
};

const getMonthlyRevenue = async () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const revenue = await prisma.payment.aggregate({
    where: {
      status: 'PAID',
      createdAt: { gte: start },
    },
    _sum: { amount: true },
  });

  return (revenue._sum.amount ?? 0) / 100;
};

/* ================= PROJECT ANALYTICS (Last 7 Days) ================= */

const getProjectAnalyticsLast7Days = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  // Fetch products from last 7 days
  const products = await prisma.product.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    select: { createdAt: true },
  });

  // Create map with counts
  const countMap: Record<string, number> = {};
  products.forEach((p) => {
    const date = p.createdAt.toISOString().slice(0, 10);
    countMap[date] = (countMap[date] || 0) + 1;
  });

  // Generate all 7 days with counts (including 0)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    last7Days.push({
      date: dateStr,
      count: countMap[dateStr] || 0,
    });
  }

  return { last7Days };
};

/* ================= AI GENERATION STATISTICS (Last 24 Hours) ================= */

const getAiGenerationLast24Hours = async () => {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const usages = await prisma.creditUsage.findMany({
    where: {
      createdAt: { gte: last24Hours },
    },
    select: {
      createdAt: true,
      creditsUsed: true,
    },
  });

  let totalTokensUsed = 0;
  const hourlyCountMap: Record<number, number> = {};

  // Process all usages
  usages.forEach((u) => {
    totalTokensUsed += u.creditsUsed * 1000; // 1 credit = 1000 tokens
    const hour = u.createdAt.getHours();
    hourlyCountMap[hour] = (hourlyCountMap[hour] || 0) + 1;
  });

  // Generate 4-hour intervals: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
  const last24Hours_data = [];
  for (let hour = 0; hour < 24; hour += 4) {
    // Sum counts for this 4-hour block
    let blockCount = 0;
    for (let h = hour; h < hour + 4 && h < 24; h++) {
      blockCount += hourlyCountMap[h] || 0;
    }

    last24Hours_data.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count: blockCount,
    });
  }

  return {
    totalTokensUsed,
    last24Hours: last24Hours_data,
  };
};

export const MetaService = {
  getAdminDashboardMeta,
};