/**
 * IMPORTS
 */
import {Client} from 'faunadb';


/**
 * EXPORTS
 */
export const fauna = new Client({
    secret: process.env.FAUNADB_KEY
});
