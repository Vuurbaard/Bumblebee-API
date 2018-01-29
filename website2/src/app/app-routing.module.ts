import { ProfileComponent } from './pages/users/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { OverviewComponent } from './pages/overview/overview.component';
import { FragmentifierComponent } from './pages/fragmentifier/fragmentifier.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/users/register/register.component';
import { LoginComponent } from './pages/users/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	// { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: 'register', component: RegisterComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: 'fragmentifier', component: FragmentifierComponent, canActivate: [AuthGuard] },
	{ path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
