import { AuthGuard } from './guards/auth.guard';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';

import { HttpClientModule } from '@angular/common/http';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { RegisterComponent } from './pages/users/register/register.component';
import { LoginComponent } from './pages/users/login/login.component';
import { FragmentifierComponent } from './pages/fragmentifier/fragmentifier.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HttpModule } from '@angular/http';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AudioService } from './services/audio.service';
import { OrderByPipe } from './pipes/order-by.pipe';

export function jwtOptionsFactory() {
	return {
		tokenGetter: () => {
			return localStorage.get('access_token');
		}
	}
}

@NgModule({
	declarations: [
		AppComponent,
		NavbarComponent,
		SidebarComponent,
		RegisterComponent,
		LoginComponent,
		FragmentifierComponent,
		OverviewComponent,
		DashboardComponent,
		OrderByPipe
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		HttpModule,
		HttpClientModule,
		FlashMessagesModule.forRoot(),
		JwtModule.forRoot({
			jwtOptionsProvider: {
				provide: JWT_OPTIONS,
				useFactory: jwtOptionsFactory
			}
		}),
		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
	],
	providers: [AuthenticationService, AudioService, AuthGuard],
	bootstrap: [AppComponent]
})
export class AppModule { }
