/**
 * IMPORTS
 */
import styles from './post.module.scss';
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import Head from "next/head";
import {RichText} from "prismic-dom";
import {getPrismicClient} from "../../services/prismic";
import {Session} from 'next-auth';


/**
 * TYPES
 */
interface IPostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    };
}


/**
 * EXPORTS
 */
export interface ISession extends Session{
    activeSubscription: Object;
}

export default function Post ({post}: IPostProps) {
    return (
       <>
        <Head>
            <title>{post.title} | Ignews</title>
        </Head>
        <main className={styles.container}>
            <article className={styles.post}>
                <h1>
                    {post.title}
                </h1>
                <time>
                    {post.updatedAt}
                </time>
                <div
                    dangerouslySetInnerHTML={
                        {
                            __html: post.content
                        }
                    }
                    className={styles.postContent}
                />
            </article>
        </main>
       </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params}) => {
    const session = await getSession({ req }) as ISession;
    const {slug} = params;

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID('post', String(slug), {lang: 'pt-br'});

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {post}
    }
}
