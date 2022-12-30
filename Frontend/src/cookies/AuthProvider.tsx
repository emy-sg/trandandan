import createTokenProvider from './createTokenProvider'
import { useState } from 'react';
import { useEffect } from 'react';

export const createAuthProvider = () => {

    const tokenProvider = createTokenProvider();

    const authFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        const token = await tokenProvider.getToken();
    
        init = init || {};
    
        init.headers = {
            ...init.headers,
            Authorization: `Bearer ${token}`,
        };
    
        return fetch(input, init);
    };

    const login: typeof tokenProvider.setToken = (newTokens) => {
        // console.log("Currently login using the Auth provider , setting a new token => " + newTokens)
        tokenProvider.setToken(newTokens);
    };
    
    const logout = () => {
        // tokenProvider.setToken(null);
    };

    const useAuth = () => {
        const [isLogged, setIsLogged] = useState(tokenProvider.isLoggedIn());
    
        useEffect(() => {
            const listener = (newIsLogged: boolean) => {
                setIsLogged(newIsLogged);
            };
    
            tokenProvider.subscribe(listener);
            return () => {
                tokenProvider.unsubscribe(listener);
            };
        }, []);
    
        return [isLogged] as [typeof isLogged];
    };
    
    /* Implementation */

    return {
        useAuth,
        authFetch,
        login,
        logout
    }
};

export const {useAuth, authFetch, login, logout} = createAuthProvider();