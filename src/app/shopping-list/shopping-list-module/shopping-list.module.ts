import { NgModule } from '@angular/core';
import { ShoppingListComponent } from '../shopping-list.component';
import { ShoppingEditComponent } from '../shopping-edit/shopping-edit.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ShoppingListComponent,
    ShoppingEditComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([ { path: '', component: ShoppingListComponent}]),
    FormsModule
  ]
})
export class ShoppingListModule { }
