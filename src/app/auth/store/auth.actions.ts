import { Action } from '@ngrx/store';

export const LOGIN_START = '[Auth] LOGIN START';
export const AUTHENTICATE_FAIL = '[Auth] LOGIN FAIL';
export const AUTHENTICATE_SUCCES = '[Auth] LOGIN';
export const LOGOUT = '[Auth] LOGOUT';
export const SINGUP_START = '[Auth] SINGUP START';
export const AUTO_LOGIN = '[Auth] AUTO LOGIN';

export class AuthenticateSucces implements Action {
    readonly type = AUTHENTICATE_SUCCES;

    constructor(public payload: {
         email: string;
         userId: string;
         token: string;
         expirationDate: Date;
        }) {}
}

export class Logout implements Action {
    readonly type = LOGOUT;
}

export class LoginStart implements Action {
    readonly type = LOGIN_START;

    constructor(public payload: {
        email: string;
        password: string;
    }) {}
}

export class AuthenticateFail implements Action {
    readonly type = AUTHENTICATE_FAIL; 

    constructor(public payload: string) {}
}

export class SingupStart implements Action {
    readonly type = SINGUP_START;

    constructor(public payload: {
        email: string;
        password: string;
    }) {}
}

export class AutoLogin implements Action {
    readonly type = AUTO_LOGIN;
    
}

export type AuthActions = 
AuthenticateSucces | Logout | 
LoginStart | AuthenticateFail | SingupStart |
AutoLogin;