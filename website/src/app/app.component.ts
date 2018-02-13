import { Component, Renderer } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	
	constructor(private renderer: Renderer) {

	}

	ngOnInit() {
		this.renderer.setElementClass(document.body, 'nav-toggle', true);
	}

	swipe(event: any) {
		console.log(event);
		if(event == "swipeleft") {
			this.renderer.setElementClass(document.body, 'nav-toggle', false);
		}
		else if(event == "swiperight") {
			this.renderer.setElementClass(document.body, 'nav-toggle', true);
		}
	}
}
