import { render, screen } from '@testing-library/react';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

jest.mock('next-auth/client');
jest.mock('next/router');

const POST =
{
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '10 de abril'
};
jest.mock('../../services/prismic');

describe("Post preview page", () => {
    it("should renders correctly", () => {
        const useSessionMocked = mocked(useSession);
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<Post post={POST} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
        expect(screen.getByText("Post excerpt")).toBeInTheDocument();
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
    });

    it("should redirects user to full post when user is subscribed", async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);
        const pushMock = jest.fn();

        useSessionMocked.mockReturnValueOnce(
            [{ activeSubscription: 'fake-active-subscription' }, false]
        ) as any;

        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any);

        render(<Post post={POST} />);

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
    });

    it("should loads initial data", async () => {
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

        const response = await getStaticProps({ params: { slug: POST.slug } } as any);

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
