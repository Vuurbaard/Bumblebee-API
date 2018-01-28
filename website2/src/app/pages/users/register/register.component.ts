import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

	name: String;
	username: String;
	email: String;
	password: String;

	constructor(private flashMessagesService: FlashMessagesService, private authenticationService: AuthenticationService, private router: Router) { }

	ngOnInit() {
	}

	onRegisterSubmit() {
		const user = {
			name: this.name,
			email: this.email,
			username: this.username,
			password: this.password
		}

		// Check required fields
		// if (!this.validateService.validateRegister(user)) {
		// 	this.flashMessagesService.show('Please fill in all fields', { cssClass: 'alert-danger' });
		// }

		// // Validate email
		// else if (!this.validateService.validateEmail(user.email)) {
		// 	this.flashMessagesService.show('Please enter a valid email', { cssClass: 'alert-danger' });
		// }

		//var flashMessagesService = this.flashMessagesService;

		this.authenticationService.registerUser(user).subscribe(data => {
			if (data.success) {
				//flashMessagesService.show('You are now register and can login', { cssClass: 'alert-success' });
				this.router.navigate(['/login']);
			}
			else {
				//flashMessagesService.show('Something went wrong', { cssClass: 'alert-danger' });
				this.router.navigate(['/register']);
			}
		});
	}

}
