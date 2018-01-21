import { AuthService } from './auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';

@Injectable()
export class AudioService {

	private host: String;

	constructor(private authService: AuthService, private http: Http) {
		if (isDevMode()) {
			this.host = 'http://localhost:3000';
		}
		else {
			this.host = 'http://bumblebee.mijnproject.nu:3000';
		}

	}

	download(url: string) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authService.getToken());

		return this.http.post(this.host + '/audio/download', { url: url }, { headers: headers }).map(res => res.json());
	}

	saveFragments(sourceId: string, fragments: Array<any>) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authService.getToken());

		return this.http.post(this.host + '/audio/fragments', { sourceId: sourceId, fragments: fragments }, { headers: headers }).map(res => res.json());
	}

	tts(text: string) {
		console.log("tts:", text);
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authService.getToken());

		return this.http.post(this.host + '/audio/tts', { text: text }, { headers: headers }).map(res => res.json());
	}
}
