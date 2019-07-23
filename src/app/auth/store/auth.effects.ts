import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FIREBASE_AUTH_BASE_URL } from 'src/app/utils/constants';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

const handleAuthentication = (resData) => {
    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    const user = new User(resData.email, resData.localId, resData.idToken, resData.expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSucces({
        email: resData.email,
        userId: resData.localId,
        token: resData.idToken,
        expirationDate: expirationDate
    });

}

const handleError = (error) => {
    let errorMessage = 'An unknows error occured!';
            if (!error.error || !error.error.error) {
                return of(new AuthActions.AuthenticateFail(errorMessage));
            }
            switch(error.error.error.message) {
                case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already';
                break;
                case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist.';
                break;
                case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct';
                break;
            }
            return of(new AuthActions.AuthenticateFail(errorMessage));
}

@Injectable()
export class AuhtEffects {
    params: HttpParams = new HttpParams().set('key', environment.firebaseConfig.apiKey);

    constructor(private actions$: Actions, 
                private http: HttpClient,
                private router: Router,
                private authService: AuthService) {}

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SINGUP_START),
        switchMap((signupAction: AuthActions.SingupStart) => {
        return this.http.post<AuthResponseData>(`${FIREBASE_AUTH_BASE_URL}signupNewUser`,
           {email: signupAction.payload.email, 
            password: signupAction.payload.password, 
            returnSecureToken: true},
           {params: this.params})
           .pipe( 
               tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
               map(resData => handleAuthentication(resData)),
               catchError(error => handleError(error)));
        })
        
    )
    

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>(`${FIREBASE_AUTH_BASE_URL}verifyPassword`, 
            {email: authData.payload.email, 
             password: authData.payload.password, 
             returnSecureToken: true},
            {params: this.params})
            .pipe( 
                tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
                map(resData => handleAuthentication(resData)),
                catchError(error => handleError(error)));
        }),
    );

    @Effect({ dispatch: false})
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData')
            this.router.navigate(['/auth']);
        })
    )

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            const userData: {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: string;
              } = JSON.parse(localStorage.getItem('userData'));
              if (!userData) {
                return { type: 'DUMMY'};
              }
          
              const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
          
              if (loadedUser.token) {
                const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);  
                return new AuthActions.AuthenticateSucces({
                  email: loadedUser.email,
                  userId: loadedUser.id,
                  token: loadedUser.token,
                  expirationDate: new Date(userData._tokenExpirationDate)
                })
              }
              return { type: 'DUMMY'};
         }) 
    )

    @Effect({ dispatch: false})
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCES),
        tap(() => this.router.navigate(['/']))
    )
}