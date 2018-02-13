import { Component, OnInit, Renderer } from '@angular/core';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

	constructor(public renderer: Renderer) { }

	ngOnInit() {
	}

	toggleSubnav() {
		//this.renderer.setElementClass(document.body, 'nav-toggle', this.showMenu);
		// $('.nav-second').on('show.bs.collapse', function () {
		// 	$('.nav-second.in').collapse('hide');
		// });
	}
}
