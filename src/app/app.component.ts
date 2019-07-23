import { Component, OnInit } from '@angular/core';
import { DataStorageService } from './shared/data-storage.service';
import { AuthService } from './auth/auth.service';
import { Store } from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'recipe-project';

  constructor(private dataStorageService: DataStorageService,
              private authService: AuthService,
              private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.dataStorageService.fetchRecipes().subscribe();
    this.store.dispatch(new AuthActions.AutoLogin());
  }
}
