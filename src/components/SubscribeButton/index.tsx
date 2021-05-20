/**
 * IMPORTS
 */
import {signIn, useSession} from 'next-auth/client';
import {useRouter} from 'next/router';
import {api} from '../../services/api';
import {getStripeJs} from '../../services/stripe-js';
import styles from './styles.module.scss';


/**
 * TYPES
 */
import {ISession} from '../../pages/posts/[slug]';


/**
 * EXPORTS
 */
export function SubscribeButton ()
{
    // get current session
    const [session] = useSession() as [ISession, boolean];

    // get router handler
    const router = useRouter();

    /**
     * I handle the user subscribe.
     * 
     * :returns: promise with nothing
     */
    async function handleSubscribe (): Promise<void>
    {
        // session not defined: redirect to sign in page
        if (!session)
        {
            signIn('github');
            return;
        }

        // session defined and there is an active subscription: redirect to posts page
        if (session.activeSubscription)
        {
            router.push('/posts');
            return;
        }

        // session defined and user doesn't has an active subscription: do subscription
        try
        {
            // request subscription
            const response = await api.post('/subscribe');

            // get session id from response
            const {sessionId} = response.data;

            // get stripe reference
            const stripe = await getStripeJs();

            // redirect to stripe checkout page
            await stripe.redirectToCheckout({sessionId});
        }

        // subscription failed: show message
        catch (err)
        {
            alert('Ops, ocorreu um problema.');
            console.error({error: err.message});
        }
    }

    // return component
    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    );
}
