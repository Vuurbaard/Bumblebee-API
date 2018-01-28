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
import { JwtModule } from '@auth0/angular-jwt';

@NgModule({
	declarations: [
		AppComponent,
		NavbarComponent,
		SidebarComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		HttpClientModule,
		JwtModule.forRoot({
			config: {
				tokenGetter: () => {
					return localStorage.getItem('access_token');
				},
				whitelistedDomains: [environment.apiUrl]
			}
		}),
		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
	],
	providers: [AuthenticationService],
	bootstrap: [AppComponent]
})
export class AppModule { }
