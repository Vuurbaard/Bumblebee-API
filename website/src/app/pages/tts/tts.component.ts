import { AudioService } from './../../services/audio.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isDevMode } from '@angular/core';

declare var WaveSurfer: any;
declare var vis: any;

@Component({
	selector: 'app-tts',
	templateUrl: './tts.component.html',
	styleUrls: ['./tts.component.scss']
})
export class TtsComponent implements OnInit {

	wavesurfer: any;
	host: string;

	constructor(private route: ActivatedRoute, private audioService: AudioService) { }

	ngOnInit() {

		// TODO: Move this to config module?
		if (isDevMode()) {
			this.host = 'http://localhost:3000';
		}
		else {
			this.host = 'http://bumblebee.mijnproject.nu:3000';
		}

		var me = this;
		this.wavesurfer = WaveSurfer.create({
			container: '#waveform-tts',
			waveColor: '#2b3e50',
			progressColor: 'white'
		});

		this.wavesurfer.on('ready', function () {
			me.wavesurfer.play();
		});

		var tts = this.route.snapshot.params['text'];
		if (tts) {
			this.play(tts);
		}
	}

	play(text: string) {
		this.audioService.tts(text).subscribe(data => {

			this.wavesurfer.load(this.host + data.file);

			//console.log(data.debug);
			//this.drawGraph(data.debug.nodes, data.debug.path);
		});
	}


}
