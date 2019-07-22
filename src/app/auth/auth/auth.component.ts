import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthResponseData } from '../auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
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

    this.isLoading = true;

    let authObs: Observable<AuthResponseData>;

    if (this.isLoginMode) {
      // login
      authObs = this.authService.login(email, password);
    } else {
      // signUp
      authObs =  this.authService.signUp(email, password);
    }

    authObs.subscribe(
      resData =>  {
        this.isLoading = false;
        this.router.navigate(['/recipes'])
      },
      errorMessage => {
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
    
    authForm.reset();
  }
}
