import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authenticationService: AuthenticationService, private router: Router) {

	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.authenticationService.isLoggedIn()) {
			return true;
		}
		else {

			if(state.url != "/login") {
				this.router.navigate(['/login', state.url]);
			}
			
			return false;
		}
	}
}