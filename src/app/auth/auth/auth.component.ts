import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../store/auth.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  isLoginMode = true;
  isLoading = false;
  error: string = null;
  private storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
   this.storeSub = this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    })
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    if (!authForm.valid) {
      return;
    }
  
    const email = authForm.value.email;
    const password = authForm.value.password;

    if (this.isLoginMode) {
      // login
      this.store.dispatch(new AuthActions.LoginStart({
        email: email,
        password: password
      }))
    } else {
      // signUp
      this.store.dispatch(new AuthActions.SingupStart({
        email: email,
        password: password
      }))
    }
    
    authForm.reset();
  }

  ngOnDestroy() {
    this.storeSub.unsubscribe();
  }
}
