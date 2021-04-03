/**
 * IMPORTS
 */
import Link from "next/link";
import {useRouter} from "next/router";
import {cloneElement} from "react";


/**
 * TYPES
 */
import {ActiveLinkProps} from './index.d';


/**
 * EXPORTS
 */
export function ActiveLink ({children, activeClassName, ...rest}: ActiveLinkProps) {
    // get current path from routes
    const {asPath} = useRouter();

    // path it's provided class name: use class name
    const className = asPath === rest.href
        ? activeClassName
        : '';

    // return component
    return (
        <Link {...rest}>
            {
                cloneElement(children, {
                    className
                })
            }
        </Link>
    );
}
