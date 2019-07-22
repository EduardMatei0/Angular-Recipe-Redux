import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FIREBASE_AUTH_BASE_URL } from '../utils/constants';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  params: HttpParams = new HttpParams().set('key', environment.firebaseConfig.apiKey);
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer:any;

  constructor(private http: HttpClient,
             private router: Router) { }

  signUp(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${FIREBASE_AUTH_BASE_URL}signupNewUser`,
           {email, password, returnSecureToken: true},
           {params: this.params})
           .pipe(
             catchError(this.handleError),
             tap(resData => this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${FIREBASE_AUTH_BASE_URL}verifyPassword`, 
            {email, password, returnSecureToken: true},
            {params: this.params})
            .pipe(
              catchError(this.handleError),
              tap(resData => this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)));
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }
  
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer =  setTimeout(() => {
      this.logout();
    }, expirationDuration)
  }

  private handleAuthentication(email: string, localId:string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, localId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknows error occured!';
    if (!error.error || !error.error.error) {
      return throwError(errorMessage);
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
    return throwError(errorMessage);
  }
}
