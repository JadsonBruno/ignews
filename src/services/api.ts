/**
 * IMPORTS
 */
import axios from 'axios';


/**
 * EXPORTS
 */
export const api = axios.create({
    baseURL: '/api'
});
