/* eslint-disable @typescript-eslint/no-explicit-any */
export const toUnixDate = (value: unknown): Date => {
    if (typeof value === 'number') {
        return new Date(value * 1000);
    }

    throw new Error('Invalid unix timestamp from Stripe');
};

export const getSubscriptionIdFromInvoice = (
    invoice: any
): string | null => {
    if (typeof invoice.subscription === 'string') {
        return invoice.subscription;
    }

    if (
        invoice.subscription &&
        typeof invoice.subscription === 'object' &&
        'id' in invoice.subscription
    ) {
        return invoice.subscription.id;
    }

    return null;
};
