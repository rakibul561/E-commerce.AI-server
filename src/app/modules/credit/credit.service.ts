import { PrismaClient } from '@prisma/client';
import { CREDIT_COSTS, CreditAction } from '../../config/subscription.config';
import ApiError from '../../errors/apiError';


const prisma = new PrismaClient();

const hasCredits = async (userId: string, action: CreditAction) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) throw new ApiError(404, 'User not found');

  return user.credits >= CREDIT_COSTS[action];
};

const deductCredits = async (userId: string, action: CreditAction) => {
  const cost = CREDIT_COSTS[action];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) throw new ApiError(404, 'User not found');
  if (user.credits < cost) throw new ApiError(400, 'Insufficient credits');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    }),
    prisma.creditUsage.create({
      data: { userId, action, creditsUsed: cost },
    }),
  ]);
};

const addCredits = async (userId: string, amount: number) => {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
};

export const CreditService = {
  hasCredits,
  deductCredits,
  addCredits
};