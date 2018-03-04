import { environment } from './../../environments/environment';
import { Http, Headers } from '@angular/http';
import { AuthenticationService } from './authentication.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {

	constructor(private authenticationService: AuthenticationService, private http: Http) {

	}

	download(url: string) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authenticationService.token);

		return this.http.post(environment.apiUrl + '/audio/download', { url: url }, { headers: headers }).map(res => res.json());
	}

	saveFragments(sourceId: string, fragments: Array<any>) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authenticationService.token);

		return this.http.post(environment.apiUrl + '/fragments', { sourceId: sourceId, fragments: fragments }, { headers: headers }).map(res => res.json());
	}

	tts(text: string) {
		console.log("tts:", text);
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', this.authenticationService.token);

		return this.http.get(environment.apiUrl + '/tts/' + text, { headers: headers }).map(res => res.json());
	}
}
