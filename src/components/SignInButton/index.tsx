/**
 * IMPORTS
 */
import {signIn} from 'next-auth/client';
import {signOut} from 'next-auth/client';
import {useSession} from 'next-auth/client';
import {FaGithub} from 'react-icons/fa';
import {FiX} from 'react-icons/fi';
import styles from './styles.module.scss';


/**
 * EXPORTS
 */
export function SignInButton ()
{
    // get current session
    const [session] = useSession();

    // return appropriate component
    return session ? (
        <button
            type="button"
            className={styles.signInButton}
            onClick={() => signOut()}
        >
            <FaGithub color="#04d361" />
                {session.user.name}
            <FiX
                color="#737380"
                className={styles.closeIcon}
            />
        </button>
    ): (
        <button
            type="button"
            className={styles.signInButton}
            onClick={() => signIn('github')}
        >
            <FaGithub color="#eba417" />
            Sign in with Github
        </button>
    );
}
