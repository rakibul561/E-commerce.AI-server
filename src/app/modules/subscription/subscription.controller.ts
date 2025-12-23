/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { subscriptionService } from './subscription.service';


const getStatus = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const data = await subscriptionService.getSubscriptionStatus(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription status retrieved successfully",
    data
  })
});

const createCheckout = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { tier } = req.body;

  const data = await subscriptionService.createCheckoutSession(req.user.userId, tier);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Checkout session created successfully",
    data
  })
});

const cancel = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const periodEnd = await subscriptionService.cancelSubscription(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription cancelled successfully",
    data: periodEnd
  })
});

const reactivate = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  await subscriptionService.reactivateSubscription(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription reactivated successfully",
  })
});

const changePlan = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { newTier } = req.body;
  await subscriptionService.changePlan(req.user.userId, newTier);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan changed successfully",
  })
});

const billingPortal = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const url = await subscriptionService.createBillingPortalSession(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Billing portal session created successfully",
    data: url
  })
});

const getPlans = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await subscriptionService.getPlans();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plans retrieved successfully",
    data: result
  })
});

const seedPlans = catchAsync(async (_req: Request, res: Response) => {
  await subscriptionService.seedSubscriptionPlans();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subscription plans seeded successfully',
  });
});

export const SubscriptionController = {
  getStatus,
  createCheckout,
  cancel,
  reactivate,
  changePlan,
  billingPortal,
  getPlans,
  seedPlans
};


