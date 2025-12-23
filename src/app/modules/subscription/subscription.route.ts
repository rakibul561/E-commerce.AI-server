import { Router } from 'express';
import auth from '../../middlewares/auth';
import { SubscriptionController } from './subscription.controller';
import { Role } from '@prisma/client';

const router = Router();

router.get(
    '/status',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.getStatus
);

router.get('/plans', SubscriptionController.getPlans);

router.post(
    '/checkout',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.createCheckout
);

router.post(
    '/reactivate',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.reactivate
);


router.post(
    '/change-plan',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.changePlan
);


router.post(
    '/billing-portal',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.billingPortal
);

router.post(
    '/cancel',
    auth(Role.USER, Role.ADMIN),
    SubscriptionController.cancel
);


router.post(
    '/seed',
    auth(Role.ADMIN),
    SubscriptionController.seedPlans
);

router.patch(
    "/update-plans/:id",
    auth(Role.ADMIN),
    SubscriptionController.updatePlans
);

router.delete(
    "/delete-plan/:id",
    auth(Role.ADMIN),
    SubscriptionController.deletePlan
)

export const SubscriptionRoutes = router;



