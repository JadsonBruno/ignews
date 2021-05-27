import { render, screen } from '@testing-library/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import { getSession } from 'next-auth/client';

jest.mock('next-auth/client');

const POST =
{
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '10 de abril'
};
jest.mock('../../services/prismic');

describe("Post page", () => {
    it("should renders correctly", () => {
        render(<Post post={POST} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
        expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    });

    it("should redirects user if no subscriptioin is found", async () => {
        const getSessionMocked = mocked(getSession);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: null
        } as any);

        const response = await getServerSideProps({ params: { slug: POST.slug } } as any);

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                })
            })
        )
    });

    it("should loads initial data", async () => {
        const getSessionMocked = mocked(getSession);
        const getPrismicClientMocked = mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {
                            type: 'heading',
                            text: POST.title
                        }
                    ],
                    content: [
                        {
                            type: 'paragraph',
                            text: 'Post content'
                        }
                    ]
                },
                last_publication_date: '04-01-2021'
            })
        } as never)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any);

        const response = await getServerSideProps({ params: { slug: POST.slug } } as any);

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: POST.slug,
                        title: POST.title,
                        content: '<p>Post content</p>',
                        updatedAt: '01 de abril de 2021'
                    }
                }
            })
        )
    });
});
