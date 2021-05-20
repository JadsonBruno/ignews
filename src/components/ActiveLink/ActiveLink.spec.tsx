import {render, screen} from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock('next/router', () => {
    return {
        useRouter() {
            return {
                asPath: '/'
            }
        }
    }
});

describe('ActiveLink component', () => {
    test('should renders correctly', () => {
        render(
            <ActiveLink
                href="/"
                activeClassName="active"
            >
                <a>Home</a>
            </ActiveLink>
        );
    
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('adds active class if the link as currently active', () => {
        render(
            <ActiveLink
                href="/"
                activeClassName="active"
            >
                <a>Home</a>
            </ActiveLink>
        );
    
        expect(screen.getByText('Home')).toHaveClass('active');
    });

    test('does not add active class if the link are not active', () => {
        render(
            <ActiveLink
                href="/home"
                activeClassName="active"
            >
                <a>Home</a>
            </ActiveLink>
        );
    
        expect(screen.getByText('Home')).not.toHaveClass('active');
    });
})
