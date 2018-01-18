import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { FlashMessagesService } from 'angular2-flash-messages';

declare var WaveSurfer: any;

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	constructor(private audioService: AudioService, private flashMessagesService: FlashMessagesService) { }

	ngOnInit() {

	}

}
