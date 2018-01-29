import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthenticationService } from './../../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	username: string;
	password: string;

	constructor(private authService: AuthenticationService, private router: Router, private flashMessagesService: FlashMessagesService) { }

	ngOnInit() {
	}

	onLoginSubmit() {
		const user = {
			username: this.username,
			password: this.password
		}

		this.authService.authenticateUser(user).subscribe(data => {
			if (data.success) {
				this.authService.storeUserData(data.token, data.user);
				this.flashMessagesService.show('You are now logged in', {
					cssClass: 'alert-success',
					timeout: 5000
				});
				this.router.navigate(['dashboard']);
			}
			else {
				this.flashMessagesService.show(data.msg, {
					cssClass: 'alert-danger',
					timeout: 5000
				});
				this.router.navigate(['login']);
			}
		});
	}
}
