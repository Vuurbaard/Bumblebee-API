import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	tts: string;

	constructor(private authService: AuthenticationService) { }

	ngOnInit() {
	}

	tryTTS() {
		
	}

}
