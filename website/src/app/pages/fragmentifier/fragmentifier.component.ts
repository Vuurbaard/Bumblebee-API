import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AudioService } from '../../services/audio.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';

declare var WaveSurfer: any;

@Component({
	selector: 'fragmentifier',
	templateUrl: './fragmentifier.component.html',
	styleUrls: ['./fragmentifier.component.scss'],
})
export class FragmentifierComponent implements OnInit {

	wavesurfer: any;
	slider: any;
	canvas: any;
	downloaded: Boolean = false;
	start: Number;
	end: Number;
	isFragmenting: Boolean = false;
	fragments: Array<any> = [];
	url: string = "https://www.youtube.com/watch?v=9-yUbFi7VUY";
	private host: String;

	// Gets returned from the API
	sourceId: string;

	constructor(private audioService: AudioService, private flashMessagesService: FlashMessagesService, private router: Router) {

		// TODO: Move this to config module?
		if (isDevMode()) {
			this.host = 'http://localhost:3000';
		}
		else {
			this.host = 'http://bumblebee.mijnproject.nu:3000';
		}
	}

	ngOnInit() {
		var me = this;

		this.wavesurfer = WaveSurfer.create({
			container: '#waveform',
			waveColor: 'white',
			progressColor: '#f6a821'
		});
		
		this.slider = document.querySelector('#slider');

		this.slider.oninput = function () {
			var zoomLevel = Number(me.slider.value);
			me.wavesurfer.zoom(zoomLevel);
		};
	}
	
	ngOnDestroy() {
		this.wavesurfer.destroy();
	}

	download() {
		console.log('Downloading from url:', this.url);
		this.audioService.download(this.url).subscribe(data => {
			console.log('Downloaded:', data);
			this.wavesurfer.load(this.host + data.url);
			this.downloaded = true;
			this.sourceId = data.sourceId;

			if (data.fragments) {
				var fragments = new Array();

				for(var fragment of data.fragments) {
					fragments.push({word: fragment.word.text, start: fragment.start, end: fragment.end});
				}
				this.fragments = fragments;
			}
		});
	}

	another() {
		this.downloaded = false;
		this.start = null;
		this.end = null;
		this.isFragmenting = false;
		this.fragments = [];
	}

	play() {
		this.wavesurfer.play();
	}

	pause() {
		this.wavesurfer.pause();
	}

	fragmentStart() {
		if (!this.isFragmenting) {
			this.start = this.wavesurfer.backend.getCurrentTime();
			this.isFragmenting = true;
		}
	}

	fragmentEnd() {
		if (this.isFragmenting) {
			this.end = this.wavesurfer.backend.getCurrentTime();
			this.isFragmenting = false;

			let fragment = {
				start: this.start,
				end: this.end,
				word: "",
			}

			this.fragments.push(fragment);
		}

	}

	removeFragment(fragment) {
		this.fragments.splice(this.fragments.indexOf(fragment), 1);
	}

	playFragment(fragment) {
		var start = Number(fragment.start);
		var end = Number(fragment.end);
		this.wavesurfer.play(start, end);
	}

	save() {
		//let id = this.youtube.replace('https://www.youtube.com/watch?v=', '');

		this.audioService.saveFragments(this.sourceId, this.fragments).subscribe(data => {
			if (data.success) {
				this.flashMessagesService.show('Fragments are submitted for review! Thank you!', {
					cssClass: 'alert-success',
					timeout: 5000
				});
			}
			else {
				this.flashMessagesService.show(data.error, {
					cssClass: 'alert-danger',
					timeout: 5000
				});
			}
		});

	}
}
