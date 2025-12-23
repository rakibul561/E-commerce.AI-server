import { SubscriptionTier } from '@prisma/client';
import config from '.';


export interface SubscriptionPlan {
    priceId: string | null;
    credits: number;
    creditsPerMonth: number;
    name: string;
    price: number;
    features: string[];
}

export const SUBSCRIPTION_PLANS: Record<
    SubscriptionTier,
    SubscriptionPlan
> = {
    FREE: {
        priceId: null,
        credits: 20,
        creditsPerMonth: 10,
        name: 'Free Plan',
        price: 0,
        features: [
            '20 initial credits',
            '10 credits per month',
            'Basic AI generation',
            'Limited exports',
        ],
    },

    BASIC: {
        priceId: config.stripe.basicPlan as string, 
        credits: 100,
        creditsPerMonth: 100,
        name: 'Basic Plan',
        price: 99,
        features: [
            '100 credits per month',
            'AI-powered product generation',
            'Image search & generation',
            'Basic video search',
            'Shopify & WooCommerce export',
        ],
    },

    PRO: {
        priceId: config.stripe.proPlan as string, 
        credits: 500,
        creditsPerMonth: 500,
        name: 'Pro Plan',
        price: 299,
        features: [
            '500 credits per month',
            'Advanced AI generation',
            'AI writing style adaptation',
            'AI video creation',
            'Priority support',
            'Unlimited exports',
        ],
    },

    ENTERPRISE: {
        priceId: config.stripe.enterprisePlan as string, 
        credits: 2000,
        creditsPerMonth: 2000,
        name: 'Enterprise Plan',
        price: 499,
        features: [
            '2000 credits per month',
            'All Pro features',
            'Custom AI training',
            'Dedicated account manager',
            'API access',
            'White-label support',
        ],
    },
};
;

export enum CreditAction {
    GENERATE_TITLE = 'GENERATE_TITLE',
    GENERATE_DESCRIPTION = 'GENERATE_DESCRIPTION',
    GENERATE_SEO = 'GENERATE_SEO',
    DETECT_CATEGORY = 'DETECT_CATEGORY',
    IMAGE_SEARCH = 'IMAGE_SEARCH',
    IMAGE_GENERATION = 'IMAGE_GENERATION',
    VIDEO_SEARCH = 'VIDEO_SEARCH',
    VIDEO_GENERATION = 'VIDEO_GENERATION',
    STYLE_ADAPTATION = 'STYLE_ADAPTATION',
    KEYWORD_GENERATION = 'KEYWORD_GENERATION',
}


export const CREDIT_COSTS: Record<CreditAction, number> = {
    [CreditAction.GENERATE_TITLE]: 1,
    [CreditAction.GENERATE_DESCRIPTION]: 2,
    [CreditAction.GENERATE_SEO]: 1,
    [CreditAction.DETECT_CATEGORY]: 1,
    [CreditAction.IMAGE_SEARCH]: 2,
    [CreditAction.IMAGE_GENERATION]: 5,
    [CreditAction.VIDEO_SEARCH]: 2,
    [CreditAction.VIDEO_GENERATION]: 10,
    [CreditAction.STYLE_ADAPTATION]: 3,
    [CreditAction.KEYWORD_GENERATION]: 1,
};
