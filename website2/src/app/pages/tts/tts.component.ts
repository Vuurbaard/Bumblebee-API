import { environment } from './../../../environments/environment';
import { AudioService } from './../../services/audio.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var WaveSurfer: any;

@Component({
	selector: 'app-tts',
	templateUrl: './tts.component.html',
	styleUrls: ['./tts.component.scss']
})
export class TtsComponent implements OnInit {

	wavesurfer: any;

	constructor(private route: ActivatedRoute, private audioService: AudioService) { }

	ngOnInit() {
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
			this.load(tts);
		}
	}

	load(text: string) {
		this.audioService.tts(text).subscribe(data => {
			this.wavesurfer.load(environment.apiUrl + data.file);
		});
	}

	play() {
		this.wavesurfer.play();
	}

	pause() {
		this.wavesurfer.pause();
	}

}
