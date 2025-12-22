/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import catchAsync from '../../utils/catchAsync';
import { stripe } from '../../utils/stripe';
import config from '../../config';
import { PaymentService } from './payment.service';

export const handleStripeWebhook = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
        const sig = req.headers['stripe-signature'];

        if (!sig) {
            res.status(400).send('No signature found');
            return;
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                config.stripe.stripeWebHookSecret as string
            );
        } catch (err: any) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await PaymentService.handleCheckoutCompleted(
                    event.data.object as Stripe.Checkout.Session
                );
                break;

            case 'customer.subscription.updated':
                await PaymentService.handleSubscriptionUpdated(
                    event.data.object as Stripe.Subscription
                );
                break;

            case 'customer.subscription.deleted':
                await PaymentService.handleSubscriptionDeleted(
                    event.data.object as Stripe.Subscription
                );
                break;

            case 'invoice.payment_succeeded':
                await PaymentService.handleInvoicePaymentSucceeded(
                    event.data.object as Stripe.Invoice
                );
                break;

            case 'invoice.payment_failed':
                await PaymentService.handleInvoicePaymentFailed(
                    event.data.object as Stripe.Invoice
                );
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    }
);


export const paymentController = { handleStripeWebhook };