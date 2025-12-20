
import Stripe from "stripe";
import { sendEmail } from "../../utils/emailSender";


const handleStripeWebhooksEvent = async (event: Stripe.Event) => {

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;

            if (!orderId) break;

            // ! update payment status 
            await sendEmail({
                to: session.customer_email as string,
                subject: "Payment Successful 🎉",
                html: `
      <h2>Payment Confirmed</h2>
      <p>Amount: $${session.amount_total as number / 100} USD</p>
    `,
            });

            break;
        }

        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata?.orderId;

            if (!orderId) break;

            //    ! update payment stats and order status


            break;
        }

        case "charge.succeeded": {
            const charge = event.data.object as Stripe.Charge;
            const orderId = charge.metadata?.orderId;

            if (!orderId) break;

            // await prisma.order.update({
            //     where: { id: orderId },
            //     data: {
            //         paymentStatus: PaymentStatus.PAID,
            //     },
            // });
            // console.log(`Order ${orderId} updated from charge.succeeded`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
};

export const PaymentService = {
    handleStripeWebhooksEvent
};