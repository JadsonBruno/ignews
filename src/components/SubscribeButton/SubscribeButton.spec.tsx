import {render, screen, fireEvent} from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { SubscribeButton } from '.';

jest.mock('next-auth/client');

jest.mock('next/router');

describe('SubscribButton component', () => {
    test('should renders correctly', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SubscribeButton />);

        expect(screen.getByText('Subscribe now')).toBeInTheDocument();
    });

    it('should redirect user to sign in when not authenticated', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false]);

        const signInMocked = mocked(signIn);

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(signInMocked).toHaveBeenCalled();
    });

    it('should redirect to posts when user already has a subscription', () => {
        const useRouterMocked = mocked(useRouter);
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([{
            user: {
                name: 'John Doe',
                email: 'john.doe@example.com',
            },
            activeSubscription: 'fake-active',
            expires: 'fake-expires'
        }, false]);

        const pushMock = jest.fn();

        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any);

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(pushMock).toHaveBeenCalledWith('/posts');
    });
})
