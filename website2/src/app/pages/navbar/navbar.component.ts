import { Component, OnInit, Renderer } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	showMenu: boolean = false;
	tts: string;

	constructor(public authService: AuthenticationService, public renderer: Renderer) { }

	ngOnInit() {
	}

	tryTTS() {
		
	}

	toggleMenu() {
		this.showMenu = !this.showMenu;	
		this.renderer.setElementClass(document.body, 'nav-toggle', this.showMenu);

		// this.renderer.setElementClass(document.body, 'nav-toggle', true);
		//$("body").toggleClass("nav-toggle");
	}

}
