import { JwtHelperService } from '@auth0/angular-jwt';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {

	constructor(private jwtHelper: JwtHelperService) {

	}

	login() {

	}

	logout() {

	}

	isLoggedIn() {
		const token: string = localStorage.getItem('access_token');

    	return token != null && !this.jwtHelper.isTokenExpired(token);
	}
}
