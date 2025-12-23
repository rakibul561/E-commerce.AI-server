/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Stripe from 'stripe';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from '../../config/subscription.config';
import { CreditService } from '../credit/credit.service';
import { stripe } from '../../utils/stripe';
import { prisma } from '../../prisma/prisma';


const handleCheckoutCompleted = async (
    session: Stripe.Checkout.Session
): Promise<void> => {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as keyof typeof SUBSCRIPTION_PLANS;

    if (!userId || !tier) return;

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    const stripeSubscription =
        (await stripe.subscriptions.retrieve(
            subscriptionId
        )) as Stripe.Subscription;

    const plan = SUBSCRIPTION_PLANS[tier];

    const currentPeriodStart =
        typeof stripeSubscription.current_period_start === 'number'
            ? new Date(stripeSubscription.current_period_start * 1000)
            : null;

    const currentPeriodEnd =
        typeof stripeSubscription.current_period_end === 'number'
            ? new Date(stripeSubscription.current_period_end * 1000)
            : null;

    await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            tier,
            status: 'ACTIVE',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: plan.priceId!,
            currentPeriodStart,
            currentPeriodEnd,
            creditsPerMonth: plan.creditsPerMonth,
        },
        update: {
            tier,
            status: 'ACTIVE',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: plan.priceId!,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
        },
    });

    // Initial credits (signup bonus / first month)
    await CreditService.addCredits(userId, plan.credits);

    console.log(`✅ Subscription created for user ${userId}`);
};


const handleSubscriptionUpdated = async (
    subscription: Stripe.Subscription
): Promise<void> => {
    const customerId = subscription.customer as string;

    const userSubscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
    });

    if (!userSubscription) return;

    let status: SubscriptionStatus = 'ACTIVE';

    if (subscription.status === 'canceled') status = 'CANCELLED';
    if (subscription.status === 'past_due') status = 'PAST_DUE';
    if (
        subscription.status === 'unpaid' ||
        subscription.status === 'incomplete'
    ) {
        status = 'INACTIVE';
    }

    const currentPeriodStart =
        typeof subscription.current_period_start === 'number'
            ? new Date(subscription.current_period_start * 1000)
            : userSubscription.currentPeriodStart;

    const currentPeriodEnd =
        typeof subscription.current_period_end === 'number'
            ? new Date(subscription.current_period_end * 1000)
            : userSubscription.currentPeriodEnd;

    await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
            status,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
    });

    console.log(`🔄 Subscription updated for user ${userSubscription.userId}`);
};


const handleSubscriptionDeleted = async (
    subscription: Stripe.Subscription
): Promise<void> => {
    const customerId = subscription.customer as string;

    const userSubscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
    });

    if (!userSubscription) return;

    await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
            status: 'CANCELLED',
            tier: 'FREE',
            creditsPerMonth: SUBSCRIPTION_PLANS.FREE.creditsPerMonth,
        },
    });

    console.log(`❌ Subscription cancelled for user ${userSubscription.userId}`);
};


const handleInvoicePaymentSucceeded = async (
    invoice: Stripe.Invoice
): Promise<void> => {
    const customerId = invoice.customer as string;

    const userSubscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
    });

    if (!userSubscription) return;

    const exists = await prisma.payment.findUnique({
        where: { stripeInvoiceId: invoice.id },
    });

    if (exists) return;

    const line = invoice.lines.data[0];



    const currentPeriodStart =
        typeof line?.period?.start === 'number'
            ? new Date(line.period.start * 1000)
            : userSubscription.currentPeriodStart;

    const currentPeriodEnd =
        typeof line?.period?.end === 'number'
            ? new Date(line.period.end * 1000)
            : userSubscription.currentPeriodEnd;

    await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
            currentPeriodStart,
            currentPeriodEnd,
            status: 'ACTIVE',
        },
    });

    await prisma.payment.create({
        data: {
            userId: userSubscription.userId,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? 'usd',
            status: PaymentStatus.PAID,
        },
    });


    const plan = SUBSCRIPTION_PLANS[userSubscription.tier];

    await CreditService.addCredits(
        userSubscription.userId,
        plan.creditsPerMonth
    );

    console.log(
        `💳 Invoice paid → period updated & ${plan.creditsPerMonth} credits added`
    );
};


const handleInvoicePaymentFailed = async (
    invoice: Stripe.Invoice
): Promise<void> => {
    const customerId = invoice.customer as string;

    const userSubscription = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
    });

    if (!userSubscription) return;

    await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: { status: 'PAST_DUE' },
    });

    await prisma.payment.create({
        data: {
            userId: userSubscription.userId,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_due ?? 0,
            currency: invoice.currency ?? 'usd',
            status: PaymentStatus.FAILED,
        },
    });

    console.log(`⚠️ Payment failed for user ${userSubscription.userId}`);
};

const getAllPayment = async () => {
    return await prisma.payment.findMany();
};


// get payment by user
const getPaymentByUser = async (userId: string) => {
    return await prisma.payment.findMany({
        where: { userId },
    });
};



export const PaymentService = {
    handleCheckoutCompleted,
    handleSubscriptionUpdated,
    handleSubscriptionDeleted,
    handleInvoicePaymentSucceeded,
    handleInvoicePaymentFailed,
    getAllPayment,
    getPaymentByUser
};
