import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authenticationService: AuthenticationService, private router:Router) {

	}

	canActivate() {
		if(this.authenticationService.isLoggedIn()) {
			return true;
		}
		else {
			this.router.navigate(['/login']);
			return false;
		}
	}
}