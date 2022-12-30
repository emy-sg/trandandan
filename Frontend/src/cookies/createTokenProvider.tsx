const createTokenProvider = () => {

    /* Implementation */
/**
 *   variable for storing tokens and restoring the data from local storage (to be sure that the session will not be lost after page reload):
 */
    let _token: { accessToken: string, refreshToken: string } = 
    JSON.parse(localStorage.getItem('REACT_TOKEN_AUTH') || '') || null

/**
 * 
 * The function getExpirationDate() will take a JWT token as a parameter and return expiration date timestamp on success (or null on failure):
 * @param jwtToken 
 * @returns 
 */
    const getExpirationDate = (jwtToken?: string): number | null => {
        if (!jwtToken) {
            return null;
        }
    
        const jwt = JSON.parse(atob(jwtToken.split('.')[1]));
    
        // multiply by 1000 to convert seconds into milliseconds
        return jwt && jwt.exp && jwt.exp * 1000 || null;
    };
/**
 * isExpired() to check is the timestamp expired. This function returns true if the expiration timestamp presented and if it is less than Date.now().
 * @param exp 
 * @returns 
 */
    const isExpired = (exp?: number) => {
        if (!exp) {
            return false;
        }
    
        return Date.now() > exp;
        
    };

    const setToken = (token: typeof _token )  => {
        if (token) {
            // console.log("SETTING HERE ")
            localStorage.setItem('REACT_TOKEN_AUTH', JSON.stringify(token));
        } else {
            localStorage.removeItem('REACT_TOKEN_AUTH');
        }
        _token = token;
        notify();
    };
/**
 * . Function getToken() should return token and update it if it is necessary. This function should be async because it may make a network request to update token.
 * @returns 
 */
 const getToken = async () => {
    if (!_token) {
        return null;
    }

    // if (isExpired(getExpirationDate(_token.accessToken))) {
    //     const updatedToken = await fetch('/update-token', {
    //         method: 'POST',
    //         body: _token.refreshToken
    //     })
    //         .then(r => r.json());

    //     setToken(updatedToken);
    // }

    return _token && _token.accessToken;
};
    /**
     * Function isLoggedIn() will be simple: it will return true if _tokens is not null and will not check for access token expiration (in this case we will not know about expiration access token until we get fail on getting token, but usually it is sufficient, and let us keep function isLoggedIn synchronous):
     * @returns 
     */
    const isLoggedIn = () => {
        return !!_token;
    };
/**
 * I think it is a good time to create functionality for managing observers. We will implement something similar to the Observer pattern, and first of all, will create an array to store all our observers. We will expect that each element in this array is the function we should call after each change of tokens:
 */
    let observers: Array<(isLogged: boolean) => void> = [];

    /**let observers: Array<(isLogged: boolean) => void> = [];
Now we can create methods subscribe() and unsubscribe(). The first one will add new observer to the created a bit earlier array, second one will remove observer from the list.
     * 
     */

     const subscribe = (observer: (isLogged: boolean) => void) => {
        observers.push(observer);
    };
    
    const unsubscribe = (observer: (isLogged: boolean) => void) => {
        observers = observers.filter(_observer => _observer !== observer);
    };

    const notify = () => {
        const isLogged = isLoggedIn();
        observers.forEach(observer => observer(isLogged));
    };

    
    return {
        getToken,
        isLoggedIn,
        setToken,
        subscribe,
        unsubscribe,
    };
};
export default createTokenProvider