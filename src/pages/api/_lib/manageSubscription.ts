/**
 * IMPORTS
 */
import {query as q} from 'faunadb';
import {fauna} from "../../../services/fauna";
import {stripe} from '../../../services/stripe';


/**
 * EXPORTS
 */
export async function saveSubscription (
    subscriptionId: string,
    customerId: string,
    createAction = false
)
{
    // get customer ref from fauna
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    );

    // get customer subscription from stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // create subscription data
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id
    };

    // create action: create data at subcriptions
    if (createAction)
    {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                {
                    data: subscriptionData
                }
            )
        )
    }

    // not create action: replace data at subscription
    else
    {
        await fauna.query(
            q.Replace(
                q.Select(
                    'ref',
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                { data: subscriptionData}
            )
        );
    }
}