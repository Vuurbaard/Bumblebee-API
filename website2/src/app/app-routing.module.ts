import { RegisterComponent } from './pages/users/register/register.component';
import { LoginComponent } from './pages/users/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{ path: 'register', component: RegisterComponent },
	{ path: 'login', component: LoginComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
