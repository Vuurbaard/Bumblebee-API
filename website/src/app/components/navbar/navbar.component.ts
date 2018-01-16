import { Component, OnInit, Renderer, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	authService: AuthService;
	showMenu: Boolean = false;
	tts: String;

	constructor(private flashMessagesService: FlashMessagesService,
		authService: AuthService,
		private router: Router,
		private renderer: Renderer
	) {
		this.authService = authService;
	}

	ngOnInit() {
	}

	logout() {
		this.authService.logout();
		this.flashMessagesService.show('You are now logged out', {
			cssClass: 'alert-success',
			timeout: 5000
		});
		this.router.navigate(['login']);
		return false;
	}

	toggleMenu() {
		this.showMenu = !this.showMenu;

		if (this.showMenu) {
			this.renderer.setElementClass(document.body, 'hide-menu', true);

		}
		if (!this.showMenu) {
			this.renderer.setElementClass(document.body, 'hide-menu', false);
		}
	}

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		let size = event.target.innerWidth;
		if (size > 762) {
			this.renderer.setElementClass(document.body, 'hide-menu', false);
		}
		else {
			this.renderer.setElementClass(document.body, 'hide-menu', true);
		}
	}

	tryTTS() {
		this.router.navigate(['/tts', this.tts]);
	}
}
