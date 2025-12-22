import { SubscriptionTier } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from '../../config/subscription.config';
import ApiError from '../../errors/apiError';
import { stripe } from '../../utils/stripe';
import { prisma } from '../../prisma/prisma';


const getSubscriptionStatus = async (userId: string) => {

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return {
    subscription: subscription ?? { tier: 'FREE', status: 'INACTIVE' },
    credits: user?.credits ?? 0,
    plan: SUBSCRIPTION_PLANS[subscription?.tier || 'FREE'],
  };
};

const createCheckoutSession = async (
  userId: string,
  tier: SubscriptionTier
) => {
  if (!['BASIC', 'PRO', 'ENTERPRISE'].includes(tier))
    throw new ApiError(400, 'Invalid subscription tier');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) throw new ApiError(404, 'User not found');

  const plan = SUBSCRIPTION_PLANS[tier];
  if (!plan.priceId) throw new ApiError(400, 'Price ID missing');

  let customerId = user.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
  }


  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/subscription/success`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
    metadata: { userId, tier },
  });

  return { url: session.url };
};

const createBillingPortalSession = async (
  userId: string
): Promise<string> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new ApiError(404, 'No billing information found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/subscription`,
  });

  return session.url;
};

const cancelSubscription = async (userId: string): Promise<Date> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new ApiError(404, 'No active subscription found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const updated = await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  });

  return updated.currentPeriodEnd ?? new Date();
};

const reactivateSubscription = async (
  userId: string
): Promise<void> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new ApiError(404, 'No subscription found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: false },
  });
};

const changePlan = async (
  userId: string,
  newTier: SubscriptionTier
): Promise<void> => {
  if (!['BASIC', 'PRO', 'ENTERPRISE'].includes(newTier)) {
    throw new ApiError(400, 'Invalid subscription tier');
  }

  if (newTier === 'FREE') return;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new ApiError(404, 'No active subscription found');
  }

  if (subscription.tier === newTier) {
    throw new ApiError(400, 'Subscription is already on this tier');
  }

  const newPlan = SUBSCRIPTION_PLANS[newTier];
  if (!newPlan.priceId) {
    throw new ApiError(400, 'Price ID not configured for this tier');
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId
  );

  const itemId = stripeSubscription.items.data[0]?.id;
  if (!itemId) {
    throw new ApiError(500, 'Stripe subscription item not found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: itemId,
        price: newPlan.priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  await prisma.subscription.update({
    where: { userId },
    data: {
      tier: newTier,
      stripePriceId: newPlan.priceId,
      creditsPerMonth: newPlan.creditsPerMonth,
    },
  });
};


export const subscriptionService = {
  getSubscriptionStatus,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
  changePlan
};
