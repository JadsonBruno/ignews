import { render, screen } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client', () => {
    return {
        useSession: () => [null, false]
    }
});

const POSTS = [
    {
        slug: 'my-new-post',
        title: 'My New Post',
        excerpt: 'Post excerpt',
        updatedAt: '10 de abril'
    }
];
jest.mock('../../services/prismic');

describe("Posts page", () => {
    it("should renders correctly", () => {
        render(<Posts posts={POSTS} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
    });

    it("should loads initial data", async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-new-post',
                        data: {
                            title: [
                                {
                                    type: 'heading',
                                    text: 'My new post'
                                }
                            ],
                            content: [
                                {
                                    type: 'paragraph',
                                    text: 'Post excerpt'
                                }
                            ]
                        },
                        last_publication_date: '04-01-2021'
                    }
                ]
            })
        } as never);

        const response = await getStaticProps({});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [
                        {
                            slug: 'my-new-post',
                            title: 'My new post',
                            excerpt: 'Post excerpt',
                            updatedAt: '01 de abril de 2021'
                        }
                    ]
                }
            })
        )
    });
});
