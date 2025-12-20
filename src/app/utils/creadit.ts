import { prisma } from "../prisma/prisma";


export const deductCredits = async (
  userId: string,
  action: string,
  cost: number
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: { decrement: cost }
    }
  });

  await prisma.creditUsage.create({
    data: {
      userId,
      action,
      creditsUsed: cost
    }
  });
};
