/**
 * IMPORTS
 */
import { NextApiRequest, NextApiResponse } from "next";
import {query as q} from 'faunadb';
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";


/**
 * TYPES
 */
type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_customer_id: string;
    }
}


/**
 * EXPORTS
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    // post request: handle it
    if (req.method === 'POST')
    {
        // get session information from request
        const session = await getSession({req});

        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        );

        let customerId = user.data.stripe_customer_id;

        if (!customerId)
        {
             // create stripe customer
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email
            });

            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            );

            customerId = stripeCustomer.id;
        }

        // create stripe checkout session
        const stripeCheckoutSession = await stripe.checkout.sessions.create(
            {
                customer: customerId,
                payment_method_types: ['card'],
                billing_address_collection: 'required',
                line_items: [
                    {
                        price: 'price_1IZ1c3Fpu0Bw4IzvS63hL2sY', quantity: 1
                    }
                ],
                mode: 'subscription',
                allow_promotion_codes: true,
                success_url: `${window.location.origin}/posts`,
                cancel_url: `${window.location.origin}`
            }
        );

        // return stripe session id
        return res.status(200).json({sessionId: stripeCheckoutSession.id});
    }

    // not a post request: return error response
    else
    {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method not allowed');
    }
}
